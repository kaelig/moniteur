/* jshint -W079 */
var lem = require('lem')
const _ = require('lodash')
const debug = require('debug')
const log = debug('moniteur:log')
const through = require('through')
const utils = require('./utils')
const sensors = require('./sensors')

export default class Read {
  constructor (assets, options, db) {
    this.assets = assets
    this.options = options || {}
    this.assetRecorders = {}
    this.start = options.start || (Date.now() - 3600 * 24 * 30 * 1000) // defaults to a month of data
    this.end = options.end || null
    this.series = {}
    this.db = lem(db)
  }

  getMetrics (assetHash) {
    const that = this
    const hashedAssets = utils.hashAssets(that.options.assets)
    const assetType = utils.getAssetType(hashedAssets[assetHash])
    that.series[assetHash] = {}

    return _.map(_.keys(sensors[assetType]), function (metric) {
      that.series[assetHash][metric] = {
        data: []
      }

      return new Promise(function (resolve, reject) {
        const key = `assets.${assetHash}.${metric}`
        log('Opening ValueStream for:', key)
        that.db.valuestream(
          key,
          {
            start: that.start,
            end: that.end
          }
        ).pipe(through(function (data) {
          const timestamp = data.key
          const value = data.value > 0 ? data.value : null // return null when value is 0, so that Highcharts doesn't display the point at all

          that.series[assetHash][metric].data.push([timestamp, value])
          log('Fetched ' + sensors[assetType][metric].name + ' metric for ' + assetHash + ':', timestamp, value)
        }, function () {
          const processedProperties = Object.assign(sensors[assetType][metric], { data: that.series[assetHash][metric].data })
          log(`data: ${JSON.stringify(that.series[assetHash][metric].data, null, 2)}`)
          log(`processedProperties: ${JSON.stringify(processedProperties, null, 2)}`)
          resolve(processedProperties)
        }))
      })
    })
  }
}
