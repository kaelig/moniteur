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
 * @param {String} category - stylesheets|javascripts
 * @param {String} asset - Path to the asset
 * @param {Object} args - Optional arguments
 * @returns Averages by metric
 * @type Object
 */

function getAssetMetrics(category, assethash, args) {
  var CONFIG = {
    start: null,
    end: null,
    metrics: cssMetrics
  };
  CONFIG = args ? _.defaults(args, config) : config;
  
  CONFIG.metrics = CONFIG.metrics || cssMetrics;

  var computedMetric = {};
  computedMetric[assethash] = {};

  return _.map(_.keys(CONFIG.metrics), function(metric) {
    return new Promise(function(resolve, reject) {
      computedMetric[assethash][metric] = {
        filename: null,
        dataPoints: 0,
        average: 0,
        total: 0
      };

      lemdb.valuestream(
        category + '.' + assethash + '.' + metric,
        {
          start: CONFIG.start,
          end: CONFIG.end
        }
      ).pipe(through(function(data) {
        var value = data.value;
        computedMetric[assethash][metric].total += value;
        computedMetric[assethash][metric].dataPoints++;
      }, function() {
        computedMetric[assethash][metric].average = 0;

        if (computedMetric[assethash][metric].dataPoints > 0) {
          computedMetric[assethash][metric].average = computedMetric[assethash][metric].total / computedMetric[assethash][metric].dataPoints;
        }

        resolve([ metric, computedMetric[assethash][metric].average ]);
      }));
    });
  });
}

function readMultipleCSSMetrics(stylesheets) {
  return _.map(stylesheets, function(stylesheet) {
    return new Promise(function(resolve, reject) {
      var metrics = getAssetMetrics('stylesheets', md5(stylesheet));
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

// var averageSizeForOneCSS = getAssetMetrics('stylesheets', md5(config.stylesheets[0]), { metrics: {'size': 'Size'}});

Promise.all(allCSSMetrics).then(function(data) {
  console.log(
    JSON.stringify(metricsToJSON(data), null, 4)
  );
});


module.exports = {
  toJSON: metricsToJSON,
  get: getAssetMetrics
};
