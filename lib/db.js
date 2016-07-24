var levelup = require('levelup')
var redisdown = require('redisdown')
var debug = require('debug')

module.exports = function (db) {
  'use strict'

  if (db.engine === 'redis') {
    return levelup('moniteur', {
      db: redisdown,
      url: process.env.REDIS_URL ? process.env.REDIS_URL : db.url
    })
  }

  // By default, save the database on the filesystem
  const dbinstance = levelup('./' + db.directory)
  // Mock the close function, only exists in Redis
  dbinstance.prototype.close = function () { return }
  return dbinstance
}
