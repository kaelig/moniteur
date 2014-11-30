/*jshint -W079 */
var _ = require('lodash');
var debug = require('debug');
var log = debug('moniteur:log');
var Promise = require('es6-promise').Promise;
var through = require('through');
var encodeAssetKey = require('./encodeAssetKey');
var sensors = require('./sensors');
var defaultStylestatsConfig = require('../config/stylestats.json');

var Read = module.exports = function Read(assets, options, db) {
  this.assets = assets;
  this.options = options || {};
  this.category = options.category || 'stylesheets';
  this.assetRecorders = {};
  this.styleStatsConfig = options.styleStatsConfig || defaultStylestatsConfig;
  this.start = options.start || (Date.now() - 3600 * 24 * 7 * 1000); // defaults to a week of data
  this.end = options.end || null;
  this.series = {};

  this.db = db;
};


Read.prototype = {
  getMetrics: function(assethash) {
    var that = this;
    that.series[assethash] = {};

    return _.map(_.keys(sensors[that.category]), function(metric) {
      that.series[assethash][metric] = {
        data: []
      };

      return new Promise(function(resolve, reject) {

        var key = 'assets.' + that.category + '.' + assethash + '.' + metric;
        log('Opening ValueStream for:', key);
        that.db.valuestream(
          key,
          {
            start: that.start,
            end: that.end
          }
        ).pipe(through(function(data) {
          var timestamp = data.key;
          var value = data.value > 0 ? data.value : null; // return null when value is 0, so that Highcharts doesn't display the point at all

          that.series[assethash][metric].data.push([timestamp, value]);
          log('Fetched ' + sensors[that.category][metric].name + ' metric for ' + assethash +':', timestamp, value);
        }, function() {
          function properties() {
            return _.object(_.map(sensors[that.category][metric], function(value, property) {
              return [property, sensors[that.category][metric][property]];
            }));
          }

          resolve(_.extend(properties(), { data: that.series[assethash][metric].data }));

        }));
      });
    });
  }
};
