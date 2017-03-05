const fs = require('fs')
const StyleStats = require('stylestats')
const debug = require('debug')
const validUrl = require('valid-url')
const sensors = require('./sensors')
const JSParser = require('./jsparser')
const utils = require('./utils')

const log = debug('moniteur:log')

/**
 * Argument is file path or not
 * @param {String} file
 * @returns {Boolean}
 */
function isFile (file) {
  try {
    return fs.existsSync(file) && fs.statSync(file).isFile()
  } catch (error) {
    return false
  }
}

// const setRecorder = (key, )

module.exports = class Record {
  constructor (assets, db) {
    this.assets = assets
    this.recorders = {}
    this.db = db
  }

  init () {
    return Object.keys(this.assets).map(assetName =>
      new Promise((resolve, reject) => {
        this.recorders = this.recorders || {}
        const assetHash = utils.getAssetHash(assetName)
        const assetEndpoints = this.assets[assetName]
        const assetType = utils.getAssetType(assetEndpoints)
        this.recorders[assetHash] = {}

        resolve(
          Object.keys(sensors[assetType]).map(metric => {
            log('Set up recorder:', assetName, metric)
            const key = 'assets.' + assetHash + '.' + metric
            this.db.index(key, metric)
            this.recorders[assetHash][metric] = this.db.recorder(key)
          })
        )
      })
    )
  }

  recordDataPoints () {
    return Object.keys(this.assets).map(assetName => {
      const assetHash = utils.getAssetHash(assetName)
      const assetEndpoints = this.assets[assetName]
      const assetType = utils.getAssetType(assetEndpoints)
      switch (assetType) {
        case 'js':
          const assetToParse = !Array.isArray(assetEndpoints) ? assetEndpoints.split(',') : assetEndpoints
          const urls = assetToParse.filter(validUrl.isUri)
          const files = assetToParse.filter(isFile)

          return new Promise((resolve, reject) => {
            const jsparser = new JSParser(urls, files)

            return jsparser.parse((error, stats) => {
              if (error) {
                return reject(error)
              }
              return Object.keys(sensors['js']).map(metric =>
                this.recorders[assetHash][metric](stats[metric], () =>
                  resolve(`Recorded: ${assetHash} 'js' ${assetEndpoints} ${metric} ${stats[metric]}`)
                )
              )
            })
          })
        case 'css':
          return new Promise((resolve, reject) => {
            const stats = new StyleStats(assetEndpoints)

            // returns a Promise
            // each promise performs an asynchronous StyleStats.parse operation
            stats.parse((error, result) => {
              if (error) {
                return reject(error)
              }
              return Object.keys(sensors['css']).map(metric =>
                this.recorders[assetHash][metric](result[metric], () =>
                  resolve(`Recorded: ${assetHash} css ${assetEndpoints} ${metric} ${result[metric]}`)
                )
              )
            })
          })
      }
    })
  }
}
