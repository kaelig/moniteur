const fs = require('fs')
const StyleStats = require('stylestats')
const _ = require('lodash')
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
  constructor (options, db) {
    this.options = options = options || {}
    this.recorders = {}
    this.styleStatsConfig = options.styleStatsConfig || defaultStylestatsConfig
    this.db = db
  }

  init () {
    const that = this
    return _.map(_.keys(that.options.assets), function (asset) {
      return new Promise(function (resolve, reject) {
        that.recorders = that.recorders || {}
        const assetHash = utils.getAssetHash(asset)
        const assetType = utils.getAssetType(that.options.assets[asset])
        that.recorders[assetHash] = {}

        _.each(_.keys(sensors[assetType]), function (metric) {
          log('Set up recorder:', asset, metric)
          const key = 'assets.' + assetHash + '.' + metric
          that.db.index(key, metric)
          that.recorders[assetHash][metric] = that.db.recorder(key)
        })
      })
    })
  }

  recordDataPoints () {
    const that = this

    return _.map(_.keys(that.options.assets), function (asset) {
      return new Promise(function (resolve, reject) {
        const assetHash = utils.getAssetHash(asset)
        const assetType = utils.getAssetType(that.options.assets[asset])

        switch (assetType) {
          case 'js':
            const assetToParse = !Array.isArray(that.options.assets[asset]) ? Array.of(that.options.assets[asset]) : that.options.assets[asset]

            const urls = []
            const files = []

            // check arguments which is url or file path or other
            assetToParse.forEach(function (assetURL) {
              if (isFile(assetURL) && ['js'].indexOf(path.extname(assetURL)) !== -1) {
                files.push(assetURL)
              } else if (isDirectory(assetURL)) {
                fs.readdirSync(assetURL).filter(function (file) {
                  return (['js'].indexOf(path.extname(file)) !== -1)
                }).forEach(function (file) {
                  files.push(assetURL + file)
                })
              } else if (validUrl.isUri(assetURL) && path.extname(assetURL).indexOf('.js') !== -1) {
                urls.push(assetURL)
              } else if (validUrl.isUri(assetURL)) {
                urls.push(assetURL)
              } else {
                glob.sync(assetURL).filter(function (file) {
                  return (path.extname(file) === '.js')
                }).forEach(function (file) {
                  files.push(file)
                })
              }
            })

            return new Promise(function (resolve, reject) {
              const jsparser = new JSParser(urls, files)
              log(jsparser)

              jsparser.parse(function (error, stats) {
                if (error) {
                  return reject(error)
                }
                _.each(_.keys(sensors[assetType]), function (metric) {
                  // // write a new value for each tracked metric
                  that.recorders[assetHash][metric](stats[metric])
                  log('Recorded:', assetType, asset, metric, stats[metric])
                })
              })
            })
          case 'css':
            const stats = new StyleStats(that.options.assets[asset], that.styleStatsConfig)

            // returns a Promise
            // each promise performs an asynchronous StyleStats.parse operation
            stats.parse(function (error, result) {
              if (error) {
                return reject(error)
              }
              _.each(_.keys(sensors[assetType]), function (metric) {
                // write a new value for each tracked metric
                that.recorders[assetHash][metric](result[metric])
                log('Recorded:', assetType, asset, metric, result[metric])
              })
            })
        }
        resolve({ asset: asset })
      })
    })
  }
}
