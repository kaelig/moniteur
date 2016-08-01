import express from 'express'
import utils from '../lib/utils'

const router = express.Router()

export default router.get('/', (req, res) => {
  const assets = Object.keys(res.locals.assets).map((asset) =>
    ({
      name: asset,
      hash: utils.getAssetHash(asset),
      type: utils.getAssetType(res.locals.assets[asset])
    })
  )
  res.render('index', { title: 'moniteur', assets: assets })
})
