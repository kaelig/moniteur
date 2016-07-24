import express from 'express'

const router = express.Router()

export default router.get('/', (req, res) => {
  const assets = Object.keys(res.locals.config.assets).map((asset) => {
    const resources = !Array.isArray(res.locals.config.assets[asset]) ? Array.of(res.locals.config.assets[asset]) : res.locals.config.assets[asset]

    return {
      name: asset,
      resources: resources
    }
  })
  res.render('welcome', { title: 'moniteur', assets: assets })
})
