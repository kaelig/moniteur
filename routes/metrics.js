/*jshint -W079 */
var _ = require('lodash');
var express = require('express');
var router = express.Router();
var readMetrics = require('../lib/read.js');
var Promise = require('es6-promise').Promise;

// Example: 
// Average of all time: /asset/stylesheets/adf6e9c154cb57a818f7fb407085bff6/average
// Average between two dates: /asset/stylesheets/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475/average
// Series (since forever): /metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/average
// Series between two dates: /metrics/stylesheets/adf6e9c154cb57a818f7fb407085bff6/1015711104475..1415711104475

router.get(/^\/(\w+)\/(\w+)(\/(\d+)\.\.(\d+))?(\/average)?$/, function(req, res) {

  var metricreading;
  var category = req.params[0];
  var assethash = req.params[1];
  var average = req.params[5];
  var options = {
    start: req.params[3] || 0,
    end: req.params[4] || 0
  };

  res.type('application/json');

  if (average) {
    metricreading = readMetrics.getAverage(category, assethash, options);
    Promise.all(metricreading).then(function(data) {
      res.send(
        JSON.stringify(_.object(data), null, 4)
      );
    });
  } else {
    metricreading = readMetrics.getSeries(category, assethash, options);
    Promise.all(metricreading).then(function(data) {
      res.send(
        JSON.stringify(data, null, 4)
      );
    });
  }

});

module.exports = router;
