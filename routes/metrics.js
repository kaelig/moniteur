import express from 'express'
import Read from '../lib/read'
import debug from 'debug'
import lem from 'lem'

const router = express.Router()
const log = debug('moniteur:log')

// Example:
// Series (since forever): /metrics/css/adf6e9c154cb57a818f7fb407085bff6
// Series between two dates: /metrics/css/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475
export default router.get(/^\/(\w+)\/(\w+)(\/(\d+)\.\.(\d+))?$/, (req, res) => {
  const assetType = req.params[0]
  const assetHash = req.params[1]
  const start = req.params[3] || false
  const end = req.params[4] || false

  res.type('application/json')
  const read = new Read(assetType, assetHash, start, end, res.locals.assets, lem(res.locals.db))

  Promise.all(read.getMetrics()).then((data) => {
    res.send(JSON.stringify(data, null, 4))
  }, (reason) => log(reason))
})
