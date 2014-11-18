'use strict';

var debug = require('debug');
var log = debug('moniteur:log');
var defaults = require('lodash').defaults;
var fs = require('fs');
var shjs = require("shelljs");
var path = require('path');
var program = require('commander');

var defaultConfig = require(path.join(__dirname, '../config/default.json'));
var extendConfig = {};

// Extend default config when --config is specified
program
  .option('-c, --config [path]', 'specify a configuration file');


/**
 * Tries to find a configuration file in either project directory
 * or in the home directory. Configuration files are named
 * '.moniteur.json'.
 *
 * @returns {string} a path to the config file
 */
function findConfig() {
	var name = ".moniteur.json";
	var proj = findFile(name);
	var home = path.normalize(path.join(process.env.HOME, name));

	if (proj) {
		return proj;
	}

	if (shjs.test("-e", home)) {
		return home;
	}

	return null;
}
/**
 * Searches for a file with a specified name starting with
 * 'dir' and going all the way up either until it finds the file
 * or hits the root.
 *
 * @param {string} name filename to search for (e.g. .jshintrc)
 * @param {string} dir  directory to start search from (default:
 *										  current working directory)
 *
 * @returns {string} normalized filename
 */
function findFile(name, dir) {
	dir = dir || process.cwd();

	var filename = path.normalize(path.join(dir, name));
	var parent = path.resolve(dir, "../");

	if (shjs.test("-e", filename)) {
		return filename;
	}

	if (dir === parent) {
		return null;
	}

	return findFile(name, parent);
}

// Look for a .moniteur.json file in current working directory and
// in the user's home directory
if (findConfig()) {
  var rootConfig = require(findConfig());
  extendConfig = rootConfig;
  log('Configuration file found:', findConfig());
}


// If --config is provided, use it over any other configuration
if (program.config) {
  var userConfig = require(program.config);
  extendConfig = userConfig;
  log('Configuration file option:', program.config);
}

var config = module.exports = defaults(extendConfig, defaultConfig);

log('Config loaded:', JSON.stringify(config, null, 4));
