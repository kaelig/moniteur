/* global describe, it, expect, jest, jasmine */
jest.disableAutomock()
const utils = require('../lib/utils')
const md5 = require('md5')

const assets = {
  SingleResource: 'http://foo.com/something.css',
  Bundle: [
    'http://bar.com/something.css'
  ]
}

describe('hashedAssets', () => {
  it('should hash assets', () => {
    const hashedAssets = utils.hashAssets(assets)
    expect(hashedAssets[md5('SingleResource')]).toEqual(jasmine.any(String))
    expect(hashedAssets[md5('Bundle')]).toEqual(jasmine.any(Array))
  })
})

describe('assetType', () => {
  it('returns the correct type', () => {
    expect(utils.getAssetType('/path/something.css')).toEqual('css')
    expect(utils.getAssetType('/path/to.html')).toEqual('html')
    expect(utils.getAssetType('http://css.com/something.css')).toEqual('css')
    expect(utils.getAssetType(['http://bar.com/something.css'])).toEqual('css')
  })
})

describe('getAssetTypeFromHash', () => {
  it('returns the correct asset type', () => {
    const hash = md5(Object.keys(assets)[0])
    expect(utils.getAssetTypeFromHash(hash, assets)).toEqual('css')
  })
})
