var _ = require('lodash')
var md5 = require('md5')
const allAssets = {
  'assets': {
    'FT desktop CSS bundle': [
      'http://s1.ft-static.com/m/style/90975546/bundles/core.css',
      'http://navigation.webservices.ft.com/v1/navigation/ft/css/style.min.css',
      'http://s1.ft-static.com/m/style/5c37627a/bundles/nonArticle.css'
    ],
    "Guardian's CSS": [
      'http://assets.guim.co.uk/stylesheets/global.css',
      'http://assets.guim.co.uk/stylesheets/head.default.css'
    ],
    'Main CSS': 'fixtures/main.css',
    'Another CSS': 'fixtures/main2.css',
    'ABC Script': 'fixtures/abc.js',
    'My XYZ Script': 'fixtures/xyz.js',
    'My Bundle of Scripts': [
      'fixtures/abc.js',
      'fixtures/xyz.js'
    ],
    'A remote Script': 'http://assets.guim.co.uk/javascripts/bootstraps/app.js'
  }
}

const hashAssets = (assets) => {
  return _.mapKeys(assets.assets, (value, key) => {
    return md5(key)
  })
}

console.log(hashAssets(allAssets))
