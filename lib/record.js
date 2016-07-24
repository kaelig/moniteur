import fs from 'fs'
import StyleStats from 'stylestats'
import debug from 'debug'
import sensors from './sensors'
import path from 'path'
import JSParser from './jsparser'
import utils from './utils'
import glob from 'glob'
import validUrl from 'valid-url'

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
  constructor (assets, db) {
    this.assets = assets
    this.recorders = {}
    this.db = db
  }

  init () {
    return Object.keys(this.assets).map((asset) => {
      return new Promise((resolve, reject) => {
        this.recorders = this.recorders || {}
        const assetHash = utils.getAssetHash(asset)
        const assetEndpoints = this.assets[asset]
        const assetType = utils.getAssetType(assetEndpoints)
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
    return Object.keys(this.assets).map((asset) => {
      const assetHash = utils.getAssetHash(asset)
      const assetEndpoints = this.assets[asset]
      const assetType = utils.getAssetType(assetEndpoints)

      switch (assetType) {
        case 'js':
          const assetToParse = !Array.isArray(assetEndpoints) ? Array.of(assetEndpoints) : assetEndpoints

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
              return Object.keys(sensors['js']).map((metric) =>
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
              return Object.keys(sensors['css']).map((metric) =>
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
