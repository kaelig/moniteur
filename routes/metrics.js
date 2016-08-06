import express from 'express'
import debug from 'debug'
import lem from 'lem'
import sensors from '../lib/sensors'
import highland from 'highland'

const _ = highland
const router = express.Router()
const log = debug('moniteur:log')

// Example:
// Series (since forever): /metrics/css/adf6e9c154cb57a818f7fb407085bff6
// Series between two dates: /metrics/css/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475
export default router.get(/^\/(\w+)\/(\w+)(\/(\d+)\.\.(\d+))?$/, (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

  const assetType = req.params[0]
  const assetHash = req.params[1]
  const start = req.params[3] || (Date.now() - 3600 * 24 * 30 * 1000)
  const end = req.params[4] || Date.now()
  const db = lem(res.locals.db)

  // Get Array of values for metric
  _(Object.keys(sensors[assetType])).flatMap((metric) => {
    const key = `assets.${assetHash}.${metric}`
    log('Opening ValueStream for:', key)
    return _(db.valuestream(
      key,
      {
        start: start,
        end: end
      }
    ))
      .filter((data) => data.value !== 0)
      .map((data) =>
        [
          data.key,
          data.value
        ]
      )
      .collect()
      .map((data) => Object.assign(
        sensors[assetType][metric],
        { data: data }))
  }).toArray((data) => {
    res.json(data, null, 4)
  })
})
