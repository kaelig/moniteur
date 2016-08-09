const md5 = require('md5')
const path = require('path')
const url = require('url')
const validUrl = require('valid-url')

const getAssetHash = name => md5(name)

const hashAssets = assets =>
  Object.assign(
    {},
    ...Object.keys(assets).map(assetName =>
      ({[getAssetHash(assetName)]: assets[assetName]})
    )
  )

const getAssetType = (assetPath) => {
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

const getAssetTypeFromHash = (assetHash, assets) =>
  getAssetType(hashAssets(assets)[assetHash])

module.exports = {
  getAssetHash: getAssetHash,
  hashAssets: hashAssets,
  getAssetType: getAssetType,
  getAssetTypeFromHash: getAssetTypeFromHash
}
