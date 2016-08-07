const md5 = require('md5')
const path = require('path')
const url = require('url')
const validUrl = require('valid-url')

module.exports = {
  getAssetHash: name => md5(name),
  hashAssets: (assets) => {
    var hashedAssets = {}
    Object.keys(assets).map((asset) => {
      hashedAssets[md5(asset)] = assets[asset]
    })
    return hashedAssets
  },
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
