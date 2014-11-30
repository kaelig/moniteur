'use strict';

var md5 = require('MD5');
var path = require('path');
var url = require('url');
var validUrl = require('valid-url');

module.exports = {
  getAssetHash: function(name) {
    return md5(name);
  },
  getAssetType: function(assetPath) {
    var assetType = false;

    // If it's an array, take the first URL
    assetPath = Array.isArray(assetPath) ? assetPath[0] : assetPath;

    if (validUrl.isUri(assetPath)) {
      assetPath = url.parse(assetPath).path; // If it's a URL, omit the domain name
    }
    if (assetPath.indexOf('css') > -1) {
      assetType = 'css'; // if the path or URL contains "css"
    } else if (assetPath.indexOf('js') > -1) {
      assetType = 'js'; // If the path or URL contains "js"
    } else {
      assetType = path.extname(assetPath).slice(1); // Otherwise, rely on the file extension
    }

    return assetType;
  }
};
