const level = require('level')
const levelup = require('levelup')
const encode = require('encoding-down')

module.exports = function (db) {
  if (db.redis_url) {
    const RedisDown = require('redisdown')
    return levelup(encode(new RedisDown('moniteur')), {
      url: db.redis_url
    })
  }

  // By default, save the database on the filesystem
  return level('./' + db.directory)
}
