import levelup from 'levelup'
import redisdown from 'redisdown'
import lem from 'lem'

export default function (db) {
  if (db.redis_url) {
    return lem(
      levelup('moniteur', {
        db: redisdown,
        url: db.redis_url
      })
    )
  }

  // By default, save the database on the filesystem
  return lem(levelup('./' + db.directory))
}
