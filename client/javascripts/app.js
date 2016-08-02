/* global Highcharts */
/* eslint-env browser */
require('./assets-graph-theme')
const prettyBytes = require('pretty-bytes')

// Promisified XMLHttpRequest from:
// http://www.html5rocks.com/en/tutorials/es6/promises/#toc-promisifying-xmlhttprequest
const get = (url) =>
  new Promise((resolve, reject) => {
    var req = new XMLHttpRequest()
    req.open('GET', url)

    req.onload = () =>
      req.status === 200 ? resolve(req.response) : reject(Error(req.statusText))

    req.onerror = () =>
      reject(Error('Network Error'))

    // Make the request
    req.send()
  })

const getJSON = (url) =>
  get(url).then(JSON.parse)

// Using Array.from until the polyfill service supports NodeList iterators
// see https://github.com/Financial-Times/polyfill-service/issues/718
Array.from(document.querySelectorAll('.js-asset')).forEach((assetContainer) => {
  const assetHash = assetContainer.dataset.assetHash
  const assetType = assetContainer.dataset.assetType

  return getJSON(`/metrics/${assetType}/${assetHash}`).then((series) => {
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
    const trend = (difference < 0) ? 'down' : 'up'
    const trendSign = (difference > 0) ? '+' : ''
    const $trendElement = document.querySelector('.js-trend-' + assetHash)

    if (difference !== 0) {
      $trendElement.querySelector('.js-trend-sign').textContent = trendSign
      $trendElement.classList.add('trend--' + trend)
      $trendElement.querySelector('.js-trend-value').textContent = prettyBytes(difference)
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
