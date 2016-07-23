var _ = require('lodash')
var fs = require('fs')
var url = require('url')
var request = require('request')
var cheerio = require('cheerio')
var gzipSize = require('gzip-size')

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
  var parsedData = {
    jsString: '',
    size: 0,
    gzippedSize: 0
  }

  var that = this

  // remote file requests
  var requestPromises = []
  this.urls.forEach(function (url) {
    var options = {}
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
    var requestPromisesInner = []

    results.forEach(function (result) {
      // push remote js data
      var type = result.headers['content-type']
      if (type.indexOf('html') > -1) {
        // parse result body
        var $ = cheerio.load(result.body)
        var $script = $('script[src]')
        var $inline = $('script:not([src])')

        // add js file count
        parsedData.files += $script.length
        parsedData.styleElements += $inline.length

        // request link[href]
        $script.each(function () {
          var srcPath = $(this).attr('src')
          var absPath = url.resolve(result.request.href, srcPath)
          var options = that.options.requestOptions
          options.url = absPath
          requestPromisesInner.push(requestSync(options))
        })

        // add text in style tags
        $inline.each(function () {
          that.scripts.push($(this).text())
        })
      } else if (type.indexOf('javascript') > -1) {
        parsedData.files += 1
        that.scripts.push(result.body)
      } else {
        throw new Error('Content type is not HTML or JavaScript!')
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
    parsedData.gzippedSize = gzipSize.sync(parsedData.jsString)

    if (_.isFunction(callback)) {
      callback(null, parsedData)
    }
  })
}

// export
module.exports = JSParser
