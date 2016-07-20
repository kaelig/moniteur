var lem = require('lem')
var levelup = require('level')
var url = require('url')

module.exports = function (db) {
  'use strict'
  var dbinstance

  if (db.engine === 'redis') {
    var redisURL = process.env.REDIS_URL ? url.parse(process.env.REDIS_URL) : db.url
    var redisdown = require('redisdown')

    dbinstance = levelup('moniteur', {
      db: redisdown,
      url: redisURL
    })
  } else {
    // By default, save the database on the filesystem
    dbinstance = levelup('./' + db.directory)
  }
  // create a new lem store using the leveldb
  return lem(dbinstance)
}
