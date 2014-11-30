var _ = require('lodash');
var express = require('express');
var md5 = require('MD5');
var router = express.Router();
var utils = require('./utils');

router.get('/', function(req, res) {
  var assets = _.map(_.keys(res.locals.config.assets), function(asset) {
    return {
      name: asset,
      hash: md5(asset),
      type: utils.getAssetType(res.locals.config.assets[asset])
    };
  });
  res.render('index', { title: 'moniteur', assets: assets });
});

module.exports = router;
