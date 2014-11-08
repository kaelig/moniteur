var StyleStats = require('stylestats');
var _ = require('underscore');
var levelup = require('levelup');
var config = require('./config-file.js');
var defaultStylestatsConfig = '../config/stylestats.json';


var createDbOperations = function(stylesheets, config) {
	var stats;
	var ops = [];
	config = config || defaultStylestatsConfig;

	_.each(stylesheets, function(stylesheet) {
		stats = new StyleStats(stylesheet, config);

		stats.parse(function (error, result) {
			// console.log(JSON.stringify(result, null, 2));
			ops.push({ type: 'put', key: stylesheet, value: JSON.stringify(result, null, 2) });
		});
	});
	return ops;
};

var ops = createDbOperations(config.stylesheets);
console.log(createDbOperations(config.stylesheets)); // []

// var db = levelup('./data');
// db.batch(ops, function (err) {
//   if (err) return console.log('Ooops!', err);
//   console.log('Great success dear leader!');
// });
//
// _.each(config.stylesheets, function(stylesheet) {
// 	db.get(stylesheet, function(err, value) {
// 		console.log(value);
// 	});
// });