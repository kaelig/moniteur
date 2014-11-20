var debug = require('debug');
var log = debug('app:log');
var express = require('express');
var router = express.Router();

/* GET config page */
router.get('/', function(req, res) {
  res.type('application/json');
  res.send(res.locals.config);
});

module.exports = router;
