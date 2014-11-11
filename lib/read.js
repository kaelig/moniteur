/*jshint -W079 */
var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var lem = require('lem');
var level = require('level');
var leveldb = level('./data');
var lemdb = lem(leveldb);
var through = require('through');
var config = require('./config-file.js');
var md5 = require('MD5');

// Todo: consolidate with main app's configuration
var cssMetrics = {
  'size': 'Size',
  'gzippedSize': 'Size (gzipped)',
  'rules': 'Rules',
  'selectors': 'Selectors'
};

/**
 * Get average metrics for an asset over a certain period
 * @param {String} asset - Path to the asset
 * @param {String} category - stylesheets|javascripts
 * @param {Object} metrics - Metrics to fetch and return
 * @param {Date} since - Start date
 * @param {Date} until - End date
 * @returns Averages by metrics
 * @type Object
 */

function getAssetMetrics(asset, category, metrics, since, until) {
  metrics = metrics || cssMetrics;
  since = since || null;
  until = until || null;
  var computedMetric = {};
  computedMetric[asset] = {};

  return _.map(_.keys(metrics), function(metric) {
    return new Promise(function(resolve, reject) {
      computedMetric[asset][metric] = {
        'dataPoints': 0,
        'average': 0,
        'total': 0
      };

      lemdb.valuestream(category + '.' + md5(asset) + '.' + metric).pipe(through(function(data) {
          // this is the actual value
          var value = data.value;

          // map-reduce beginnings
          computedMetric[asset][metric].total += value;
          computedMetric[asset][metric].dataPoints++;
      }, function() {
          computedMetric[asset][metric].average = 0;

          if (computedMetric[asset][metric].dataPoints > 0) {
            computedMetric[asset][metric].average = computedMetric[asset][metric].total / computedMetric[asset][metric].dataPoints;
          }

          resolve([ metric, computedMetric[asset][metric].average ]);
      }));
    });
  });
}

function readMultipleCSSMetrics(stylesheets) {
  return _.map(stylesheets, function(stylesheet) {
    return new Promise(function(resolve, reject) {
      var metrics = getAssetMetrics(stylesheet, 'stylesheets');
      Promise.all(metrics).then(function(data){
        resolve(_.object([stylesheet], [_.object(data)]));
      });
    });
  });
}

// transforms an array of objects into an JSON object
function metricsToJSON(data) {
  // Todo: understand this magic voodoo
  // https://stackoverflow.com/questions/26856067/underscore-array-of-objects-to-flat-object-whats-the-magic
  return _.reduce(data, _.extend);
  // return _.assign.apply(_, data);
}

var allCSSMetrics = readMultipleCSSMetrics(config.stylesheets);

// var averageSizeForOneCSS = getAssetMetrics(config.stylesheets[0], 'stylesheets', {'size': 'Size'});

Promise.all(allCSSMetrics).then(function(data){
  console.log(
    JSON.stringify(metricsToJSON(data), null, 4)
  );
});
