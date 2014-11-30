'use strict';

var md5 = require('MD5');
var path = require('path');
var url = require('url');

module.exports = {
  getAssetHash: function(name) {
    return md5(name);
  },
  getAssetType: function(assetPath) {
    var assetType = false;

    // If it's an array, take the first URL
    assetPath = Array.isArray(assetPath) ? assetPath[0] : assetPath;

    var URL = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|cat|coop|int|pro|tel|xxx|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2})?)|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/;

    if (URL.test(assetPath)) {
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
