const levelup = require('levelup')
const redisdown = require('redisdown')

module.exports = function (db) {
  if (db.redis_url) {
    return levelup('moniteur', {
      db: redisdown,
      url: db.redis_url
    })
  }

  // By default, save the database on the filesystem
  return levelup('./' + db.directory)
}
