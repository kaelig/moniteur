/*jshint -W079 */
var StyleStats = require('stylestats');
var _ = require('lodash');
var debug = require('debug');
var log = debug('moniteur:log');
var Promise = require('es6-promise').Promise;
var defaultStylestatsConfig = require('../config/stylestats.json');
var sensors = require('./sensors');
var encodeAssetKey = require('./encodeAssetKey');
var path = require('path');
var JSParser = require('./jsparser');
var mime = require('mime');
var glob = require('glob');

/**
 * Argument is file path or not
 * @param {String} file
 * @returns {Boolean}
 */
function isFile(file) {
  try {
    return fs.existsSync(file) && fs.statSync(file).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Argument is directory path or not
 * @param {String} dir
 * @returns {Boolean}
 */
function isDirectory(dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch (error) {
    return false;
  }
}

var Save = module.exports = function Save(options, db) {
  this.options = options = options || {};
  this.recorders = {};
  this.styleStatsConfig = options.styleStatsConfig || defaultStylestatsConfig;
  this.db = db;
};

Save.prototype = {
  init: function() {
    var that = this;
    return _.map(_.keys(that.options.assets), function(asset) {
      return new Promise(function(resolve, reject) {
        that.recorders = that.recorders || {};
        that.recorders[encodeAssetKey(asset)] = {};

        var assetType = path.extname(that.options.assets[asset]).slice(1);

        _.each(_.keys(sensors[assetType]), function(metric) {
          log('Set up recorder:', asset, metric);
          var key = 'assets.' + encodeAssetKey(asset) + '.' + metric;
          that.db.index(key, metric);
          that.recorders[encodeAssetKey(asset)][metric] = that.db.recorder(key);
        });
      });
    });
  },
  recordDataPoints: function() {
    var that = this;

    return _.map(_.keys(that.options.assets), function(asset) {
      return new Promise(function(resolve, reject) {
      
        var assetType = path.extname(that.options.assets[asset]).slice(1);

        switch (assetType) {
          case 'js':
            assetToParse = Array.isArray(that.options.assets[asset]) ? that.options.assets[asset] : [that.options.assets[asset]];
            var URL = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|cat|coop|int|pro|tel|xxx|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2})?)|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/;

            var urls = [];
            var files = [];

            // check arguments which is url or file path or other
            assetToParse.forEach(function(assetURL) {
              if (isFile(assetURL) && ['js'].indexOf(path.extname(assetURL)) !== -1) {
                files.push(assetURL);
              } else if (isDirectory(assetURL)) {
                fs.readdirSync(assetURL).filter(function(file) {
                  return (['js'].indexOf(path.extname(file)) !== -1);
                }).forEach(function(file) {
                  files.push(assetURL + file);
                });
              } else if (URL.test(assetURL) && path.extname(assetURL).indexOf('.js') !== -1) {
                urls.push(assetURL);
              } else if (URL.test(assetURL)) {
                urls.push(assetURL);
              } else {
                glob.sync(assetURL).filter(function(file) {
                  return (path.extname(file) === '.js');
                }).forEach(function(file) {
                  files.push(file);
                });
              }
            });

            return new Promise(function(resolve, reject) {
              var jsparser = new JSParser(urls, files);
              log(jsparser);

              jsparser.parse(function(error, stats) {
                _.each(_.keys(sensors[assetType]), function(metric) {
                  // // write a new value for each tracked metric
                  that.recorders[encodeAssetKey(asset)][metric](stats[metric]);
                  log('Recorded:', asset, metric, stats[metric]);
                });
              });
            });
          case 'css':
            var stats = new StyleStats(that.options.assets[asset], that.styleStatsConfig);

            // returns a Promise
            // each promise performs an asynchronous StyleStats.parse operation
            stats.parse(function (error, result) {
              if (error) {
                return reject(error);
              }
              _.each(_.keys(sensors[assetType]), function(metric) {
                // write a new value for each tracked metric
                that.recorders[encodeAssetKey(asset)][metric](result[metric]);
                log('Recorded:', asset, metric, result[metric]);
              });
          });
        }
      });
    });
  }
};
