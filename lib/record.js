/*jshint -W079 */
var StyleStats = require('stylestats');
var _ = require('lodash');
var debug = require('debug');
var log = debug('moniteur:log');
var Promise = require('es6-promise').Promise;
var defaultStylestatsConfig = require('../config/stylestats.json');
var sensors = require('./sensors');
var encodeAssetKey = require('./encodeAssetKey');

var Save = module.exports = function Save(assets, options, db) {
  this.assets = assets;
  this.options = options = options || {};
  this.category = options.category || 'stylesheets';
  this.recorders = {};
  this.styleStatsConfig = options.styleStatsConfig || defaultStylestatsConfig;
  this.db = db;
};

Save.prototype = {
  init: function() {
    var that = this;
    // Create indexes in the database
    return _.map(_.keys(that.options.assets[that.category]), function(asset) {
      return new Promise(function(resolve, reject) {
        that.recorders[that.category] = that.recorders[that.category] || {};
        that.recorders[that.category][encodeAssetKey(asset)] = {};
        _.each(_.keys(sensors[that.category]), function(metric) {
          var key = 'assets.' + that.category + '.' + encodeAssetKey(asset) + '.' + metric;
          that.db.index(key, metric);
          that.recorders[that.category][encodeAssetKey(asset)][metric] = that.db.recorder(key);
        });
      });
    });
  },
  recordCSSDataPoint: function() {
    var that = this;

    // return the array of stylesheets into an array of promises
    return _.map(_.keys(that.assets), function(asset) {
      var stats = new StyleStats(that.assets[asset], that.styleStatsConfig);
      // console.log(JSON.stringify(stats, null, 4));
      // returns a Promise
      // each promise performs an asynchronous StyleStats.parse operation
      return new Promise(function(resolve, reject) {
        stats.parse(function (error, result) {
          if (error) {
            return reject(error);
          }
          _.each(_.keys(sensors.stylesheets), function(metric) {
            // write a new value for each tracked metric
            that.recorders[that.category][encodeAssetKey(asset)][metric](result[metric]);
          });
          resolve({ asset: asset, data: result });
        });
      });
    });
  }
};

