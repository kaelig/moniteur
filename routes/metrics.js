var _ = require('lodash');
var express = require('express');
var router = express.Router();
var readMetrics = require('../lib/read.js');
var Promise = require('es6-promise').Promise;

// Example: 
// metrics of all time: /metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6
// between two dates:   /metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475

router.get(/^\/(\w+)\/(\w+)(\/(\d+)\.\.(\d+))?$/, function(req, res) {

  var category = req.params[0];
  var assethash = req.params[1];
  var options = {
    start: req.params[3] || 0,
    end: req.params[4] || 0
  };

  var metricreading = readMetrics.get(category, assethash, options);

  Promise.all(metricreading).then(function(data) {
    res.send(
      JSON.stringify(_.object(data), null, 4)
    );
  });
});

module.exports = router;
