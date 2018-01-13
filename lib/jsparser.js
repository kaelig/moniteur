const fs = require('fs')
const request = require('request')
const gzipSize = require('gzip-size')

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
        reject(new Error('Status code is ' + response.statusCode))
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
 */
JSParser.prototype.parse = function parse () {
  // object to return
  let parsedData = {
    jsString: '',
    size: 0,
    gzippedSize: 0
  }
  // remote file requests
  const requestPromises = this.urls.map(url =>
    requestSync({url: url}))

  // JS string array from arguments
  // they will be joined into JS string
  this.files.forEach(function (jsFile) {
    // push local js data
    this.scripts.push(fs.readFileSync(jsFile, {
      encoding: 'utf8'
    }))
  })

  // get remote files
  return new Promise((resolve, reject) => {
    Promise.all(requestPromises).then((results) => {
      // requests to scripts defined in html
      let requestPromisesInner = []

      results.forEach((result) => {
        // push remote js data
        if (result.headers['content-type'].indexOf('javascript') > -1) {
          parsedData.files += 1
          this.scripts.push(result.body)
        } else {
          throw new Error('Content type is not JavaScript!')
        }
      })

      if (requestPromisesInner.length > 0) {
        return Promise.all(requestPromisesInner)
      } else {
        return true
      }
    }).then((results) => {
      if (Array.isArray(results)) {
        results.forEach(function (result) {
          this.scripts.push(result.body)
        })
      }

      // join all JS string
      parsedData.jsString = this.scripts.join('')
      parsedData.size = Buffer.byteLength(parsedData.jsString, 'utf8')
      parsedData.gzippedSize = gzipSize.sync(parsedData.jsString)
      return resolve(parsedData)
    })
      .catch(reason => reject(reason))
  })
}

// export
module.exports = JSParser
