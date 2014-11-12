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

/**
 * Get average metrics for an asset over a certain period
 * @param {String} category - stylesheets|javascripts
 * @param {String} asset - Path to the asset
 * @param {Object} args - Optional arguments
 * @returns Averages by metric
 * @type Object
 */

function getAverage(category, assethash, args) {
  var options = {
    start: null,
    end: null,
    metrics: null
  };
  options = args ? _.defaults(args, options) : options;
  
  options.metrics = options.metrics || config.cssmetrics;

  var computedMetric = {};
  computedMetric[assethash] = {};

  return _.map(_.keys(options.metrics), function(metric) {
    return new Promise(function(resolve, reject) {
      computedMetric[assethash][metric] = {
        dataPoints: 0,
        average: 0,
        total: 0
      };

      lemdb.valuestream(
        category + '.' + assethash + '.' + metric,
        {
          start: options.start,
          end: options.end
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

function getSeries(category, assethash, args) {
  var options = {
    start: null,
    end: null,
    metrics: null,
    yAxis: {
      size: 0,
      gzippedSize: 0,
      selectors: 1,
      rules: 1
    }
  };
  options = args ? _.defaults(args, options) : options;
  
  options.metrics = options.metrics || config.cssmetrics;

  var series = {};
  series[assethash] = {};

  return _.map(_.keys(options.metrics), function(metric) {
    return new Promise(function(resolve, reject) {
      series[assethash][metric] = {
        data: []
      };

      lemdb.valuestream(
        category + '.' + assethash + '.' + metric,
        {
          start: options.start,
          end: options.end
        }
      ).pipe(through(function(data) {
        var timestamp = data.key;
        var value = data.value;

        series[assethash][metric].data.push([timestamp, value]);

      }, function() {
        resolve({ name: options.metrics[metric], yAxis: options.yAxis[metric], data: series[assethash][metric].data });
      }));
    });
  });
}

function getCSSMetrics(stylesheets) {
  return _.map(stylesheets, function(stylesheet) {
    return new Promise(function(resolve, reject) {
      var metrics = getAverage('stylesheets', md5(stylesheet));
      Promise.all(metrics).then(function(data){
        resolve(_.object([stylesheet], [_.object(data)]));
      });
    });
  });
}

function getCSSSeries(stylesheets) {
  return _.map(stylesheets, function(stylesheet) {
    return new Promise(function(resolve, reject) {
      var series = getSeries('stylesheets', md5(stylesheet), { metrics: config.cssmetrics });
      Promise.all(series).then(function(data){
        resolve(_.object([stylesheet], [data]));
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

var allCSSMetrics = getCSSMetrics(config.stylesheets);

// var averageSizeForOneCSS = getAverage('stylesheets', md5(config.stylesheets[0]), { metrics: {'size': 'Size'}});

Promise.all(allCSSMetrics).then(function(data) {
  console.log(
    JSON.stringify(metricsToJSON(data), null, 4)
  );
});

var CSSseries = getCSSSeries(config.stylesheets);

Promise.all(CSSseries).then(function(data) {
  console.log(
    JSON.stringify(metricsToJSON(data), null, 4)
  );
});


module.exports = {
  toJSON: metricsToJSON,
  getAverage: getAverage,
  getSeries: getSeries
};
