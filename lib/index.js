var StyleStats = require('stylestats');
var _ = require('lodash');
var levelup = require('levelup');
var config = require('./config-file.js');
var Promise = require('es6-promise').Promise;
var defaultStylestatsConfig = '../config/stylestats.json';


var db = levelup('./data');

function createDbOperations(stylesheets, config) {
	config = config || defaultStylestatsConfig;

    // remap the array of stylesheets into an array of promises
    return _.map(stylesheets, function(stylesheet) {
		var stats = new StyleStats(stylesheet, config);
      
        // returns a Promis
        // each promise performs an asynchronous StyleStats.parse operation
        return new Promise(function(resolve, reject){
          stats.parse(function (error, result) {
            if (error){
              return reject(error); 
            }
            
            resolve({
              type: 'put',
              key: stylesheet,
              value: JSON.stringify(result, null, 2)
            });
          });
        });
	});
};

var opsP = createDbOperations(config.stylesheets);

Promise.all(opsP).then(function(stats){
  console.log(stats);
  
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
});

