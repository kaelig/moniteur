import debug from 'debug'
const log = debug('moniteur:log')
import through from 'through'
import sensors from './sensors'

export default class Read {
  constructor (assetType, assetHash, start, end, assets, db) {
    this.assetType = assetType
    this.assetHash = assetHash
    this.start = start || (Date.now() - 3600 * 24 * 30 * 1000) // defaults to a month of data
    this.end = end || null
    this.series = {}
    this.db = db
  }

  getMetrics () {
    this.series[this.assetHash] = {}

    return Object.keys(sensors[this.assetType]).map((metric) => {
      this.series[this.assetHash][metric] = {
        data: []
      }

      return new Promise((resolve, reject) => {
        const key = `assets.${this.assetHash}.${metric}`
        log('Opening ValueStream for:', key)

        return this.db.valuestream(
          key,
          {
            start: this.start,
            end: this.end
          }
        ).pipe(through((data) => {
          const timestamp = data.key
          const value = data.value > 0 ? data.value : null // return null when value is 0, so that Highcharts doesn't display the point at all

          this.series[this.assetHash][metric].data.push([timestamp, value])
          log('Fetched ' + sensors[this.assetType][metric].name + ' metric for ' + this.assetHash + ':', timestamp, value)
        }, () => {
          const processedProperties = Object.assign(sensors[this.assetType][metric], { data: this.series[this.assetHash][metric].data })
          log(`[${this.assetHash}] processedProperties: ${JSON.stringify(processedProperties, null, 2)}`)
          resolve(processedProperties)
        }))
      })
    })
  }
}
