var express = require('express');
var router = express.Router();
var config = require('../lib/config-file.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.type('application/json');
  res.send(config);
});

module.exports = router;
