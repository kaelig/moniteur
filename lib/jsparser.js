const _ = require('lodash')
const fs = require('fs')
const url = require('url')
const request = require('request')
const cheerio = require('cheerio')
const gzipSize = require('gzip-size')
const debug = require('debug')
const log = debug('moniteur:log')

/**
 * Get promised request
 * @param {Object} options
 * @returns {Promise}
 */
function requestSync (options) {
  return new Promise(function (resolve, reject) {
    request(options, function (error, response) {
      if (!error && response.statusCode === 200) {
        resolve(response)
      } else if (!error) {
        reject('Status code is ' + response.statusCode)
      } else {
        reject(error)
      }
    })
  })
}

/**
 * JSParser class
 * @param {Array} urls
 * @param {Array} files
 * @constructor
 */
function JSParser (urls, files) {
  this.urls = urls
  this.files = files
  this.scripts = []
  this.options = {}
}

/**
 * Parse JS data
 * @param {Function} callback
 */
JSParser.prototype.parse = function (callback) {
  // object to return
  const parsedData = {
    jsString: '',
    size: 0,
    gzippedSize: 0
  }

  const that = this

  // remote file requests
  const requestPromises = []
  this.urls.forEach(function (url) {
    const options = {}
    options.url = url
    requestPromises.push(requestSync(options))
  })

  // JS string array from arguments
  // they will be joined into JS string
  this.files.forEach(function (jsFile) {
    // push local js data
    that.scripts.push(fs.readFileSync(jsFile, {
      encoding: 'utf8'
    }))
  })

  // get remote files
  Promise.all(requestPromises).then(function (results) {
    // requests to scripts defined in html
    const requestPromisesInner = []

    results.forEach(function (result) {
      // push remote js data
      const type = result.headers['content-type']

      if (type.indexOf('javascript') > -1) {
        parsedData.files += 1
        that.scripts.push(result.body)
      } else {
        throw new Error('Content type is not JavaScript!')
      }
    })

    if (requestPromisesInner.length > 0) {
      return Promise.all(requestPromisesInner)
    } else {
      return true
    }
  }).then(function (results) {
    if (Array.isArray(results)) {
      results.forEach(function (result) {
        that.scripts.push(result.body)
      })
    }

    // join all JS string
    parsedData.jsString = that.scripts.join('')
    parsedData.size = Buffer.byteLength(parsedData.jsString, 'utf8')
    parsedData.gzippedSize = Buffer.byteLength(parsedData.jsString, 'utf8')

    if (_.isFunction(callback)) {
      callback(null, parsedData)
    }
  })
}

// export
module.exports = JSParser
