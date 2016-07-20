jest.disableAutomock()
const _ = require('lodash')
const read = require('../lib/read')
const md5 = require('md5')

const assets = {
  assets: {
    SingleResource: 'http://foo.com/something.css',
    Bundle: [
      'http://bar.com/something.css'
    ]
  }
}

describe('read', () => {
  it('hashes assets', () => {
    const hashedAssets = read.hashAssets(assets)
    expect(hashedAssets[md5('SingleResource')]).toEqual(jasmine.any(String))
    expect(hashedAssets[md5('Bundle')]).toEqual(jasmine.any(Array))
  })
  it('returns a constructor', () => {
    expect(new read.Read(assets, , app.locals.db)
  })
})
