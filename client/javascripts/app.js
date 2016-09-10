/* global Highcharts */
/* eslint-env browser */
require('./assets-graph-theme')
const prettyBytes = require('pretty-bytes')

Array.from(document.querySelectorAll('.js-asset')).map((assetContainer) => {
  const assetHash = assetContainer.dataset.assetHash

  return fetch(`/metrics/${assetHash}`)
    .then(res => res.json())
    .then((series) => {
      const sizes = series[0].data
      if (!sizes.length) {
        assetContainer.querySelector('#js-asset-chart-' + assetHash).innerHTML =
          `
            <div class="align-center">
              <h3>Could not find any data for this asset.</h3>
              <p>
                You may need to <a href="/support#faq-trigger">trigger a recording</a>
                so that moniteur has some data to show.
              </p>
            </div>
          `
        return
      }
      const firstSize = sizes[0][1]
      const lastSize = sizes[sizes.length - 1][1]

      const difference = lastSize - firstSize
      const prettyDifference = prettyBytes(difference)
      const trend = (difference < 0) ? 'down' : 'up'
      const trendSign = (difference > 0) ? '+' : ''
      const $trendElement = document.querySelector('.js-trend-' + assetHash)

      if (difference !== 0) {
        $trendElement.querySelector('.js-trend-sign').textContent = trendSign
        $trendElement.classList.add('trend--' + trend)
        $trendElement.querySelector('.js-trend-value').textContent = prettyDifference
        $trendElement.setAttribute('title', `${trendSign}${prettyDifference} (uncompressed) compared to the beginning of the period`)
      }

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
              return '<b>' + this.series.name + '</b><br />' + Highcharts.dateFormat('%b %e, %H:%M', this.x) + ': <b>' + (this.series.area ? prettyBytes(this.y) : this.y) + '</b>'
            }
          },
          series: series
        }
      )
    })
})
