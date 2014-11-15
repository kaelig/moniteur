'use strict';

var md5 = require('MD5');

module.exports = function(name) {
  return md5(name);
};
