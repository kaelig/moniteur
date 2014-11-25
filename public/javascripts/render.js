$(function () {
  $.getJSON('/config', function (config) {
    var stylesheets = Object.keys(config.assets.stylesheets);

    $.each(stylesheets, function(index, asset) {
      $('#container').append('<div id="highcharts-' + CryptoJS.MD5(asset) + '" class="asset"><div class="chart-wrapper"></div></div>');
      var $container = $('#highcharts-' + CryptoJS.MD5(asset));
      var $graphContainer = $container.find('.chart-wrapper');
      $.getJSON('/metrics/stylesheets/' + CryptoJS.MD5(asset), function (series) {
        var sizes = series[0].data; // sizes
        var firstSize = sizes[0][1];
        var lastSize = sizes[sizes.length-1][1];
        var differenceSinceLastSize = firstSize - lastSize;
        var trend = (differenceSinceLastSize < 0) ? 'up' : 'down';
        var trendSign = (differenceSinceLastSize < 0) ? '+' : '';

        $container.prepend(
          '<h2 class="asset-name">' +
            asset +
            ' <span class="trend trend--' + trend + '" title="Evolution">' +
              trendSign +
              prettyBytes(differenceSinceLastSize) +
            '</span>' +
          '</h2>'
        );

        if (differenceSinceLastSize === 0) {
          $container.find('.trend').html('=').removeClass('trend--down');
        }

        $graphContainer.highcharts({
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
  });
});
