/*jshint -W079 */
var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var lem = require('lem');
var level = require('level');
var leveldb = level('./data');
var lemdb = lem(leveldb);
var through = require('through');
var md5 = require('MD5');
var config = require('./config-file.js');

function encodeAssetKey(name) {
  return md5(name);
}

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
  
  options.metrics = options.metrics || config.metrics[category];

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
        'assets.' + category + '.' + assethash + '.' + metric,
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

function getSerie(category, assethash, args) {
  var options = {
    start: null,
    end: null,
    metrics: null
  };
  options = args ? _.defaults(args, options) : options;
  
  options.metrics = options.metrics || config.metrics[category];

  var series = {};
  series[assethash] = {};

  return _.map(_.keys(options.metrics), function(metric) {
    return new Promise(function(resolve, reject) {
      series[assethash][metric] = {
        data: []
      };

      lemdb.valuestream(
        'assets.' + category + '.' + assethash + '.' + metric,
        {
          start: options.start,
          end: options.end
        }
      ).pipe(through(function(data) {
        var timestamp = data.key;
        var value = data.value;

        series[assethash][metric].data.push([timestamp, value]);

      }, function() {
        resolve({
          name: options.metrics[metric].name,
          yAxis: options.metrics[metric].yAxis,
          type: options.metrics[metric].chartType || '',
          fillOpacity: options.metrics[metric].fillOpacity || '',
          data: series[assethash][metric].data
        });
      }));
    });
  });
}

function getMetrics(category, assets) {
  return _.map(_.keys(assets), function(asset) {
    return new Promise(function(resolve, reject) {
      var metrics = getAverage(category, encodeAssetKey(asset));

      Promise.all(metrics).then(function(data) {
        resolve(_.object([asset], [_.object(data)]));
      });
    });
  });
}

function getSeries(category, assets) {
  return _.map(_.keys(assets), function(asset) {
    return new Promise(function(resolve, reject) {
      var series = getSerie(
        category,
        encodeAssetKey(asset),
        { metrics: config.metrics[category] }
      );

      Promise.all(series).then(function(data) {
        resolve(_.object([asset], [data]));
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

var allCSSmetrics = getMetrics('stylesheets', config.assets.stylesheets);

// var averageSizeForOneCSS = getAverage('stylesheets', config.assets.stylesheets[0], { metrics: {'size': 'Size'}});

Promise.all(allCSSmetrics).then(function(data) {
  console.log(
    JSON.stringify(metricsToJSON(data), null, 4)
  );
});

var CSSseries = getSeries('stylesheets', config.assets.stylesheets);

Promise.all(CSSseries).then(function(data) {
  console.log(
    JSON.stringify(metricsToJSON(data), null, 4)
  );
});


module.exports = {
  toJSON: metricsToJSON,
  getAverage: getAverage,
  getSerie: getSerie,
  getSeries: getSeries
};
