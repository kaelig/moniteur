var _ = require('lodash')
var debug = require('debug')
var log = debug('app:log')
var express = require('express')
var router = express.Router()

/* GET config page */
router.get('/', function (req, res) {
  res.type('application/json')

  // Conceal database configuration settings from the public
  var config = _.omit(res.locals.config, 'db')

  res.send(JSON.stringify(config, null, 2))
})

module.exports = router
