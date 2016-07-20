/* jshint -W079 */
var _ = require('lodash')
var debug = require('debug')
var log = debug('moniteur:log')
var through = require('through')
var utils = require('./utils')
var sensors = require('./sensors')

var Read = function Read (assets, options, db) {
  this.assets = assets
  this.options = options || {}
  this.assetRecorders = {}
  this.start = options.start || (Date.now() - 3600 * 24 * 30 * 1000) // defaults to a month of data
  this.end = options.end || null
  this.series = {}

  this.db = db
}

const hashAssets = (assets) => {
  return _.mapKeys(assets.assets, (value, key) => {
    return utils.getAssetHash(key)
  })
}

Read.prototype = {
  getMetrics: function (assetHash) {
    var that = this
    log('things', that.options.assets)

    var hashedAssets = hashAssets(that.options.assets)

    log('stuff' + JSON.stringify(hashedAssets, null, 2))
    var assetType = utils.getAssetType(hashedAssets[assetHash])
    log(`Asset Type: ${assetType}`)
    that.series[assetHash] = {}

    return _.map(_.keys(sensors[assetType]), function (metric) {
      that.series[assetHash][metric] = {
        data: []
      }

      return new Promise(function (resolve, reject) {
        var key = `assets.${assetHash}.${metric}`
        log('Opening ValueStream for:', key)
        that.db.valuestream(
          key,
          {
            start: that.start,
            end: that.end
          }
        ).pipe(through(function (data) {
          var timestamp = data.key
          var value = data.value > 0 ? data.value : null // return null when value is 0, so that Highcharts doesn't display the point at all

          that.series[assetHash][metric].data.push([timestamp, value])
          log('Fetched ' + sensors[assetType][metric].name + ' metric for ' + assetHash + ':', timestamp, value)
        }, function () {
          function properties () {
            var properties = _.map(sensors[assetType][metric], function (value, property) {
              return [property, sensors[assetType][metric][property]]
            })
            log(properties)
            return properties
          }
          var processedProperties = _.extend(properties(), { data: that.series[assetHash][metric].data })
          log(`processedProperties: ${processedProperties}`)
          resolve(processedProperties)
        }))
      })
    })
  }
}

module.exports = {
  Read: Read,
  hashAssets: hashAssets
}
