/*jshint -W079 */
var StyleStats = require('stylestats');
var _ = require('lodash');
var lem = require('lem');
var level = require('level');
var config = require('./config-file.js');
var Promise = require('es6-promise').Promise;
var defaultStylestatsConfig = './config/stylestats.json';
var md5 = require('MD5');
var moment = require('moment');

// create a new leveldb - this can also be a sub-level
var leveldb = level('./data');

// create a new lem store using the leveldb
var lemdb = lem(leveldb);

var sizes = {};
var gzippedSizes = {};

function setRecorders(stylesheets) {
  // Create indexes in the database
  return _.map(stylesheets, function(stylesheet) {
    return new Promise(function(resolve, reject) {
      sizeKey = 'stylesheets.' + md5(stylesheet) + '.size';
      lemdb.index(sizeKey, "Size");
      sizes[md5(stylesheet)] = lemdb.recorder(sizeKey);

      gzippedSizeKey = 'stylesheets.' + md5(stylesheet) + '.gzippedSize';
      lemdb.index(gzippedSizeKey, "Size (gzipped)");
      gzippedSizes[md5(stylesheet)] = lemdb.recorder(gzippedSizeKey);
    });
  });
}


function addNewCSSDataPoint(stylesheets, styleStatsConfig) {
  styleStatsConfig = styleStatsConfig || defaultStylestatsConfig;

  // return the array of stylesheets into an array of promises
  return _.map(stylesheets, function(stylesheet) {
    var stats = new StyleStats(stylesheet, styleStatsConfig);

    // returns a Promise
    // each promise performs an asynchronous StyleStats.parse operation
    return new Promise(function(resolve, reject) {
      stats.parse(function (error, result) {
        if (error) {
          return reject(error);
        }
        sizes[md5(stylesheet)](result.size);
        gzippedSizes[md5(stylesheet)](result.gzippedSize);
      });
    });
  });
}

var recorders = setRecorders(config.stylesheets);

// TODO: write data points every config.poll minutes
var CSSDataPoints = addNewCSSDataPoint(config.stylesheets);

// Promise.all([recorders, CSSDataPoints]).then(function(dataPoints) {
//   console.log(dataPoints);
// });
