'use strict';

var argv = require('yargs').argv;
var _ = require('lodash');
var fs = require('fs');

var defaultConfig = require('../config/default.json');

// Extend default config when --config is specified
var config = argv.config ? require(argv.config) : {};
config = _.defaults(config, defaultConfig);

module.exports = config;
