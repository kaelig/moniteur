import levelup from 'levelup'
import redisdown from 'redisdown'
import sqldown from 'sqldown'

export default function (db) {
  if (db.postgres_url) {
    return levelup(db.postgres_url, {
      db: sqldown,
      table: 'moniteur'
    })
  }
  if (db.redis_url) {
    return levelup('moniteur', {
      db: redisdown,
      url: db.redis_url
    })
  }

  // By default, save the database on the filesystem
  return levelup('./' + db.directory)
}
