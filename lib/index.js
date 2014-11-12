/*jshint -W079 */
var StyleStats = require('stylestats');
var _ = require('lodash');
var lem = require('lem');
var level = require('level');
var config = require('./config-file.js');
var Promise = require('es6-promise').Promise;
var defaultStylestatsConfig = './config/stylestats.json';
var md5 = require('MD5');

// create a new leveldb - this can also be a sub-level
var leveldb = level('./data');

// create a new lem store using the leveldb
var lemdb = lem(leveldb);

function encodeAssetKey(name) {
  return md5(name);
}

var assetRecorders = {};

function setRecorders(category) {
  // Create indexes in the database
  return _.map(_.keys(config.assets[category]), function(asset) {
    return new Promise(function(resolve, reject) {
      assetRecorders[category] = assetRecorders[category] || {};
      assetRecorders[category][encodeAssetKey(asset)] = {};

      _.each(_.keys(config.metrics[category]), function(metric) {
        var key = 'assets.' + category + '.' + encodeAssetKey(asset) + '.' + metric;

        lemdb.index(key, metric);
        assetRecorders[category][encodeAssetKey(asset)][metric] = lemdb.recorder(key);
      });
    });
  });
}


function addNewCSSDataPoint(assets, styleStatsConfig) {
  styleStatsConfig = styleStatsConfig || defaultStylestatsConfig;

  // return the array of stylesheets into an array of promises
  return _.map(_.keys(assets), function(asset) {
    var stats = new StyleStats(assets[asset], styleStatsConfig);
    // returns a Promise
    // each promise performs an asynchronous StyleStats.parse operation
    return new Promise(function(resolve, reject) {
      stats.parse(function (error, result) {
        if (error) {
          return reject(error);
        }

        _.each(_.keys(config.metrics.stylesheets), function(metric) {
          // write a new value for each tracked metric
          assetRecorders.stylesheets[encodeAssetKey(asset)][metric](result[metric]);
        });
      });
    });
  });
}

var recorders = setRecorders('stylesheets');

// TODO: write data points every config.poll minutes
var CSSDataPoints = addNewCSSDataPoint(config.assets.stylesheets);

// Promise.all(recorders).then(function(dataPoints) {
//   console.log(dataPoints);
// });
