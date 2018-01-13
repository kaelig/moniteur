const level = require('level')

module.exports = function (db) {
  if (db.redis_url) {
    const redisdown = require('redisdown')
    return level('moniteur', {
      db: redisdown,
      url: db.redis_url
    })
  }

  // By default, save the database on the filesystem
  return level('./' + db.directory)
}
