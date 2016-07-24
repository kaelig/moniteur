/* jshint -W079 */
var _ = require('lodash')
var express = require('express')
var router = express.Router()
import Read from '../lib/read'
var debug = require('debug')
var log = debug('moniteur:log')

// Example:
// Series (since forever): /metrics/css/adf6e9c154cb57a818f7fb407085bff6
// Series between two dates: /metrics/css/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475

router.get(/^\/(\w+)\/(\w+)(\/(\d+)\.\.(\d+))?$/, function (req, res) {
  var asset = req.params[1]
  var options = {
    type: req.params[0],
    start: req.params[3] || 0,
    end: req.params[4] || 0
  }

  res.type('application/json')
  var read = new Read([asset], _.defaults(options, res.locals.config), res.locals.db)
  var assetData = read.getMetrics(asset)
  log('foo', JSON.stringify(assetData, null, 2))

  Promise.all(assetData).then(function (data) {
    log('INSTANCE', res.locals.db.options.db.close)
    res.send(
      JSON.stringify(data, null, 4)
    )
  }, reason => log(reason))

})

module.exports = router
