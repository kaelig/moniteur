/* global $, Highcharts */
require('./assets-graph-theme')
const prettyBytes = require('pretty-bytes')

$(function () {
  $('.js-asset').each(function (assetContainer) {
    const assetHash = $(this).data('asset-hash')
    const assetType = $(this).data('asset-type')

    $.getJSON('/metrics/' + assetType + '/' + assetHash, function (series) {
      const sizes = series[0].data
      const firstSize = sizes[0][1]
      const lastSize = sizes[sizes.length - 1][1]

      const difference = lastSize - firstSize
      const trend = (difference < 0) ? 'down' : 'up'
      const trendSign = (difference > 0) ? '+' : ''
      const $trendElement = $('.js-trend-' + assetHash)

      if (difference !== 0) {
        $trendElement.find('.js-trend-sign').text(trendSign)
        $trendElement.addClass('trend--' + trend)
        $trendElement.find('.js-trend-value').text(prettyBytes(difference))
      }

      const chart = Highcharts.chart(
        'asset-' + assetHash,
        {
          chart: {
            type: 'spline'
          },
          yAxis: [
            {
              title: {
                text: 'Size'
              },
              labels: {
                formatter: function () {
                  return prettyBytes(this.value)
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
            formatter: function () {
              console.log(this.series)
              return '<b>' + this.series.name + '</b><br />' + Highcharts.dateFormat('%b %e, %H:%M', this.x) + ': <b>' + (this.series.area ? prettyBytes(this.y) : this.y) + '</b>'
            }
          },
          series: series
        }
      )
    })
  })
})
