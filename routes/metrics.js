const express = require('express')
const debug = require('debug')
const lem = require('lem')
const sensors = require('../lib/sensors')
const highland = require('highland')
const utils = require('../lib/utils')

const _ = highland
const router = express.Router()
const log = debug('moniteur:log')

// Example:
// Series (since forever): /metrics/adf6e9c154cb57a818f7fb407085bff6
// Series between two dates: /metrics/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475
module.exports = router.get(/^\/(\w+)(\/(\d+)\.\.(\d+))?$/, (req, res) => {
  const assetHash = req.params[0]
  const assetType = utils.getAssetTypeFromHash(assetHash, res.locals.assets)
  const start = req.params[2] || (Date.now() - 3600 * 24 * 30 * 1000).toString()
  const end = req.params[3] || Date.now().toString()
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
      .map((data) =>
        Object.assign(
          {},
          sensors[assetType][metric],
          { data: data }))
  }).toArray((data) =>
    res.json(data))
})
