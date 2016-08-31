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
  ))

const getExtension = (p) => path.extname(p).slice(1)

const getAssetType = (assetPath) =>
  // 1. transform assetPath into an array,
  // 2. flatten the array
  // 3. take its first element
  // 4. put it into an array
  [[].concat.apply([], [assetPath]).shift()]
    .map(getExtension)
    .shift()

const getAssetTypeFromHash = (assetHash, assets) =>
  getAssetType(hashAssets(assets)[assetHash])

module.exports = {
  getAssetHash: getAssetHash,
  hashAssets: hashAssets,
  getAssetType: getAssetType,
  getAssetTypeFromHash: getAssetTypeFromHash
}
