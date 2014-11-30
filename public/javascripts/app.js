var md5 = require('MD5');
var $ = require('jQuery');
var Highcharts = require('Highcharts');
require('./assets-graph-theme');
var prettyBytes = require('pretty-bytes');

function setTrend(assetHash, firstMetric, secondMetric) {
  var difference = secondMetric - firstMetric;
  var trend = (difference < 0) ? 'down' : 'up';
  var trendSign = (difference > 0) ? '+' : '';

  $trendElement = $('.js-trend-' + assetHash);

  if (difference !== 0) {
    $trendElement.addClass('trend--' + trend);
    $trendElement.find('.js-trend-sign').text(trendSign);
    $trendElement.find('.js-trend-value').text(prettyBytes(difference));
  }
}

function graphStylesheets() {
  var sizes;
  var firstSize;
  var lastSize;

  $('.js-asset').each(function(assetContainer) {
    var assetHash = $(this).data('asset-hash');
    var assetType = $(this).data('asset-type');

    $.getJSON('/metrics/' + assetType + '/' + assetHash, function (series) {
      sizes = series[0].data;
      firstSize = sizes[0][1];
      lastSize = sizes[sizes.length-1][1];
      setTrend(assetHash, firstSize, lastSize);

      new Highcharts.Chart({
        chart: {
          type: 'spline',
          renderTo: 'js-asset-chart-' + assetHash
        },
        yAxis: [
          {
            title: {
              text: 'Size'
            },
            labels: {
              formatter: function () {
                return prettyBytes(this.value);
              }
            }
          },
          {
            title: {
              text: 'Count'
            },
            opposite: true
          }
        ],
        tooltip: {
          crosshairs: [false, true],
          formatter: function() {
            return '<b>' + this.series.name + '</b><br />' + Highcharts.dateFormat('%b %e, %H:%M', this.x) + ': <b>' + ( this.series.type === 'area' ? prettyBytes(this.y) : this.y ) + '</b>';
          }
        },
        series: series
      });
    });
  });
}

$(function () {
  graphStylesheets();
});
