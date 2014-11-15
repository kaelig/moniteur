/*jshint -W079 */
var _ = require('lodash');
var debug = require('debug');
var log = debug('app:log');
var Promise = require('es6-promise').Promise;
var through = require('through');
var encodeAssetKey = require('./encodeAssetKey');
var defaultStylestatsConfig = require('../config/stylestats.json');

var Read = module.exports = function Read(assets, options, db) {
  this.assets = assets;
  this.options = options || {};
  this.category = options.category || 'stylesheets';
  this.assetRecorders = {};
  this.styleStatsConfig = options.styleStatsConfig || defaultStylestatsConfig;
  this.start = options.start || null;
  this.end = options.end || null;
  this.series = {};

  this.lemdb = db;
};


Read.prototype = {
  getMetrics: function(assethash) {
    var that = this;
    that.series[assethash] = {};

    return _.map(_.keys(that.options.metrics[that.category]), function(metric) {
      that.series[assethash][metric] = {
        data: []
      };

      return new Promise(function(resolve, reject) {

        var key = 'assets.' + that.category + '.' + assethash + '.' + metric;
        log(key)
        that.lemdb.valuestream(
          key,
          {
            start: that.start,
            end: that.end
          }
        ).pipe(through(function(data) {
          var timestamp = data.key;
          var value = data.value;

          that.series[assethash][metric].data.push([timestamp, value]);
          // log(timestamp, value);
        }, function() {
          // log(that.series);
          resolve({
            name: that.options.metrics[that.category][metric].name,
            yAxis: that.options.metrics[that.category][metric].yAxis,
            type: that.options.metrics[that.category][metric].chartType || '',
            fillOpacity: that.options.metrics[that.category][metric].fillOpacity || '',
            data: that.series[assethash][metric].data
          });
        }));
      });
    });
  },
  all: function() {
    var that = this;
    return _.map(_.keys(that.assets[that.category]), function(asset) {
      return new Promise(function(resolve, reject) {
        var seriesP = that.getMetrics(encodeAssetKey(asset));

        Promise.all(seriesP).then(function(data) {
          resolve(_.object([asset], [data]));
        });
      });
    });
  }
};






// // transforms an array of objects into an JSON object
// function metricsToJSON(data) {
//   // Todo: understand this magic voodoo
//   // https://stackoverflow.com/questions/26856067/underscore-array-of-objects-to-flat-object-whats-the-magic
//   return _.reduce(data, _.extend);
//   // return _.assign.apply(_, data);
// }
//
// var allCSSmetrics = getMetrics('stylesheets', config.assets.stylesheets);
//
// // var averageSizeForOneCSS = getAverage('stylesheets', config.assets.stylesheets[0], { metrics: {'size': 'Size'}});
//
// Promise.all(allCSSmetrics).then(function(data) {
//   console.log(
//     JSON.stringify(metricsToJSON(data), null, 4)
//   );
// });
//
// var CSSseries = getSeries('stylesheets', config.assets.stylesheets);

// Promise.all(CSSseries).then(function(data) {
//   console.log(
//     JSON.stringify(metricsToJSON(data), null, 4)
//   );
// });

