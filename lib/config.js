'use strict';

var _ = require('lodash');
var fs = require('fs');
var exists = fs.existsSync || path.existsSync;
var path = require('path');
var program = require('commander');

var defaultConfig = require(path.join(__dirname, '../config/default.json'));
var exportConfig = {};

// Extend default config when --config is specified
program
  .option('-c, --config [path]', 'Specify a configuration file')
  .parse(process.argv);

if (program.config) {
  exportConfig = require(program.config);
}

module.exports = _.defaults(exportConfig, defaultConfig);
