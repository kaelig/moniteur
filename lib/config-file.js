'use strict';

var argv = require('yargs').argv;
var fs = require('fs');

var configFile = argv.config ? argv.config : '../config/default.json';

module.exports = require(configFile);
