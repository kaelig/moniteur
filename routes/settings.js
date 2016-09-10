const express = require('express')
const utils = require('../lib/utils')

const router = express.Router()

module.exports = router.get('/', (req, res) => {
  const assets = Object.keys(res.locals.assets).map(asset => {
    const resources = !Array.isArray(res.locals.assets[asset])
      ? Array.of(res.locals.assets[asset])
      : res.locals.assets[asset]

    return {
      name: asset,
      hash: utils.getAssetHash(asset),
      resources: resources
    }
  })
  res.render('settings', { title: 'moniteur: current settings', assets: assets })
})
