'use strict';

var lem = require('lem');
var level = require('levelup');
var url = require('url');

module.exports = function(engine) {
  engine = engine || 'local';
  var db;

  if (engine === 'redis') {
    var redisURL = process.env.REDISCLOUD_URL ? url.parse(process.env.REDISCLOUD_URL) : 'redis://localhost:6379';
    var redisdown = require('redisdown');

    db = level('moniteur', {
      db: redisdown,
      options: {
        url: redisURL,
        no_ready_check: true
      }
    });
  } else {
    // By default, save the database on the filesystem
    db = level('./.moniteur');
  }
  // create a new lem store using the leveldb
  return lem(db);
};
