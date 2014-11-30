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
    $trendElement.find('js-trend-sign').text(trendSign);
    $trendElement.find('js-trend-value').text(prettyBytes(difference));
  }
}

function graphStylesheets() {
  var sizes;
  var firstSize;
  var lastSize;
  var assetHash;

  $('.js-asset').each(function(assetContainer) {
    assetHash = $(this).data('asset-hash');

    $.getJSON('/metrics/stylesheets/' + assetHash, function (series) {
      sizes = series[0].data; // sizes
      firstSize = sizes[0][1];
      lastSize = sizes[sizes.length-1][1];
      setTrend(assetHash, firstSize, lastSize);

      $('#js-asset-graph-' + assetHash).highcharts({
        chart: {
          type: 'spline'
        },
        credits: {
          enabled: false
        },
        navigation: {
          buttonOptions: {
            enabled: false
          }
        },
        title: {
          style: {
            display: 'none'
          }
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
          },
          title: {
            enabled: false
          }
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
            },
            min: 0
          },
          {
            title: {
              text: 'Count'
            },
            opposite: true,
            min: 0
          }
        ],
        tooltip: {
          crosshairs: [false, true],
          formatter: function() {
            return '<b>' + this.series.name + '</b><br />' + Highcharts.dateFormat('%b %e, %H:%M', this.x) + ': <b>' + ( this.series.type === 'area' ? prettyBytes(this.y) : this.y ) + '</b>';
          }
        },
        plotOptions: {
          areaspline: {
            marker: {
              symbol: 'circle',
              radius: 5,
            },
            lineWidth: 3,
            states: {
              hover: {
                lineWidth: 5
              }
            },
            pointInterval: 3600000, // one hour
          },
          spline: {
            marker: {
              symbol: 'circle',
              radius: 3
            },
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 3
              }
            },
            pointInterval: 3600000 // one hour
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
