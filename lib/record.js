const fs = require('fs')
const lem = require('lem')
const StyleStats = require('stylestats')
const debug = require('debug')
const log = debug('moniteur:log')
const defaultStylestatsConfig = require('../config/stylestats.json')
const sensors = require('./sensors')
const path = require('path')
const JSParser = require('./jsparser')
const utils = require('./utils')
const glob = require('glob')
const validUrl = require('valid-url')

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

/**
 * Argument is directory path or not
 * @param {String} dir
 * @returns {Boolean}
 */
function isDirectory (dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory()
  } catch (error) {
    return false
  }
}

export default class Record {
  constructor (options, dbinstance) {
    this.options = options = options || {}
    this.recorders = {}
    this.styleStatsConfig = options.styleStatsConfig || defaultStylestatsConfig
    this.dbinstance = dbinstance
  }

  init () {
    return Object.keys(this.options.assets).map((asset) => {
      return new Promise((resolve, reject) => {
        this.db = lem(this.dbinstance)

        this.recorders = this.recorders || {}
        const assetHash = utils.getAssetHash(asset)
        const assetType = utils.getAssetType(this.options.assets[asset])
        this.recorders[assetHash] = {}

        resolve(
          Object.keys(sensors[assetType]).forEach((metric) => {
            log('Set up recorder:', asset, metric)
            const key = 'assets.' + assetHash + '.' + metric
            this.db.index(key, metric)
            this.recorders[assetHash][metric] = this.db.recorder(key)
          })
        )
      })
    })
  }

  recordDataPoints () {
    return Object.keys(this.options.assets).map((asset) => {
      const assetHash = utils.getAssetHash(asset)
      const assetProps = this.options.assets[asset]
      const assetType = utils.getAssetType(assetProps)

      switch (assetType) {
        case 'js':
          const assetToParse = !Array.isArray(assetProps) ? Array.of(assetProps) : assetProps

          const urls = []
          const files = []

          // check arguments which is url or file path or other
          assetToParse.forEach((assetURL) => {
            if (
              isFile(assetURL) &&
              ['js'].indexOf(path.extname(assetURL)) !== -1
            ) {
              files.push(assetURL)
            } else if (isDirectory(assetURL)) {
              fs.readdirSync(assetURL)
                .filter((file) => (['js'].indexOf(path.extname(file)) !== -1))
                .forEach((file) => files.push(assetURL + file))
            } else if (
              validUrl.isUri(assetURL) &&
              path.extname(assetURL).indexOf('.js') !== -1
            ) {
              urls.push(assetURL)
            } else if (validUrl.isUri(assetURL)) {
              urls.push(assetURL)
            } else {
              glob.sync(assetURL)
                .filter((file) => (path.extname(file) === '.js'))
                .forEach((file) => files.push(file))
            }
          })

          return new Promise((resolve, reject) => {
            const jsparser = new JSParser(urls, files)

            return jsparser.parse((error, stats) => {
              if (error) {
                return reject(error)
              }
              return Object.keys(sensors[assetType]).map((metric) =>
                this.recorders[assetHash][metric](stats[metric], () =>
                  resolve(`Recorded: ${assetHash} ${assetType} ${assetProps} ${metric} ${stats[metric]}`)
                )
              )
            })
          })
        case 'css':
          return new Promise((resolve, reject) => {
            const stats = new StyleStats(assetProps, this.styleStatsConfig)

            // returns a Promise
            // each promise performs an asynchronous StyleStats.parse operation
            stats.parse((error, result) => {
              if (error) {
                return reject(error)
              }
              return Object.keys(sensors[assetType]).map((metric) =>
                this.recorders[assetHash][metric](result[metric], () =>
                  resolve(`Recorded: ${assetHash} ${assetType} ${assetProps} ${metric} ${result[metric]}`)
                )
              )
            })
          })
      }
    })
  }
}
