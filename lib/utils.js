const md5 = require('md5')
const path = require('path')
const url = require('url')

/**
 * @param {String} name name of the asset to hash
 * @returns {String} hashed name
 */
const getAssetHash = md5

/**
 * @param {Object} assets
 * @returns {Object} asset object with their names hashed
 */
const hashAssets = assets =>
  Object.assign(
    {},
    ...Object.keys(assets).map(assetName =>
      ({[getAssetHash(assetName)]: assets[assetName]})
  ))

/**
 * @param {String} p path to a file
 * @returns {String} file extension without the dot
 */
const getExtension = p => path.extname(url.parse(p).pathname).slice(1)

/**
 * Get the type of an asset or array of assets
 *
 * @param {(String|Array)} assetPath path to an asset or array of paths
 * @returns String
 */
const getAssetType = assetPath =>
  /* eslint no-useless-call: 0 */
  // 1. transform assetPath into an array,
  // 2. flatten the array
  // 3. take its first element
  // 4. put it into an array
  [[].concat.apply([], [assetPath]).shift()]
    .map(getExtension)
    .shift()

/**
 * @param {String} assetHash md5 hash of an asset
 * @param {Object} assets assets containing the asset
 * @returns {String}
 */
const getAssetTypeFromHash = (assetHash, assets) =>
  getAssetType(hashAssets(assets)[assetHash])

module.exports = {
  getAssetHash: getAssetHash,
  hashAssets: hashAssets,
  getAssetType: getAssetType,
  getAssetTypeFromHash: getAssetTypeFromHash
}
