const express = require('express')
const utils = require('../lib/utils')

const router = express.Router()

module.exports = router.get('/', (req, res) => {
  const assets = Object.keys(res.locals.assets).map(asset =>
    ({
      name: asset,
      hash: utils.getAssetHash(asset),
      type: utils.getAssetType(res.locals.assets[asset])
    })
  )
  res.render('index', { title: 'moniteur', assets: assets })
})
