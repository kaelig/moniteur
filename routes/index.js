var _ = require('lodash');
var express = require('express');
var md5 = require('MD5');
var router = express.Router();

router.get('/', function(req, res) {
  var stylesheets = _.map(_.keys(res.locals.config.assets.stylesheets), function(stylesheet) {
    return {
      name: stylesheet,
      hash: md5(stylesheet)
    };
  });
  res.render('index', { title: 'moniteur', stylesheets: stylesheets });
});

module.exports = router;
