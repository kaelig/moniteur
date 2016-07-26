import $ from 'jquery'
import Highcharts from 'highcharts'
require('highcharts/modules/exporting')(Highcharts)
require('./assets-graph-theme')
import prettyBytes from 'pretty-bytes'

function setTrend (assetHash, firstMetric, secondMetric) {
  const difference = secondMetric - firstMetric
  const trend = (difference < 0) ? 'down' : 'up'
  const trendSign = (difference > 0) ? '+' : ''

  const $trendElement = $('.js-trend-' + assetHash)

  if (difference !== 0) {
    $trendElement.addClass('trend--' + trend)
    $trendElement.find('.js-trend-sign').text(trendSign)
    $trendElement.find('.js-trend-value').text(prettyBytes(difference))
  }
}

function graphStylesheets () {
  let sizes
  let firstSize
  let lastSize

  $('.js-asset').each(function(assetContainer) {
    const assetHash = $(this).data('asset-hash')
    const assetType = $(this).data('asset-type')

    $.getJSON('/metrics/' + assetType + '/' + assetHash, (series) => {
      sizes = series[0].data
      firstSize = sizes[0][1]
      lastSize = sizes[sizes.length - 1][1]
      setTrend(assetHash, firstSize, lastSize)

      Highcharts.chart(
        'js-asset-chart-' + assetHash,
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
              return '<b>' + this.series.name + '</b><br />' + Highcharts.dateFormat('%b %e, %H:%M', this.x) + ': <b>' + (this.series.type === 'area' ? prettyBytes(this.y) : this.y) + '</b>'
            }
          },
          series: series
        }
      )
    })
  })
}

$(() => {
  graphStylesheets()
})
