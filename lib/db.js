import levelup from 'levelup'
import redisdown from 'redisdown'

export default function (db) {
  if (db.redis_url) {
    return levelup('moniteur', {
      db: redisdown,
      url: db.redis_url
    })
  }

  // By default, save the database on the filesystem
  return levelup('./' + db.directory)
}
