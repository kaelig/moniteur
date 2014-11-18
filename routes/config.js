var debug = require('debug');
var log = debug('app:log');
var express = require('express');
var router = express.Router();
var config = require('../lib/config.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.type('application/json');
  log(config);
  res.send(config);
});

module.exports = router;
