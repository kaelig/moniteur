'use strict'

var md5 = require('md5')
var path = require('path')
var url = require('url')
var validUrl = require('valid-url')
var _ = require('lodash')

module.exports = {
  getAssetHash: name => md5(name),
  hashAssets: (assets) => _.mapKeys(assets, (value, key) => md5(key)),
  getAssetType: (assetPath) => {
    // If it's an array, take the first URL
    assetPath = Array.isArray(assetPath) ? assetPath[0] : assetPath

    if (validUrl.isUri(assetPath)) {
      assetPath = url.parse(assetPath).path // If it's a URL, omit the domain name
    }
    if (assetPath.indexOf('css') > -1) {
      return 'css' // if the path or URL contains "css"
    }
    if (assetPath.indexOf('js') > -1) {
      return 'js' // If the path or URL contains "js"
    }
    return path.extname(assetPath).slice(1) // Otherwise, rely on the file extension
  }
}
