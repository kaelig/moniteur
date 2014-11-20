'use strict';

var lem = require('lem');
var level = require('levelup');

module.exports = function(engine) {
  engine = engine || 'local';
  var db;

  if (engine === 'redis') {
    var redisdown = require('redisdown');

    db = level('moniteur', {
      db: redisdown,
      host: 'localhost',
      port: 6379
    });
  } else {
    // By default, save the database on the filesystem
    db = level('./.moniteur');
  }
  // create a new lem store using the leveldb
  return lem(db);
};
