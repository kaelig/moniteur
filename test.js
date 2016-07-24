var levelup = require('levelup')
var redisdown = require('redisdown')
var lem = require('lem')
var url = require('url')
var debug = require('debug')
var log = debug('moniteur:db')
var util = require('util')

var redisURL = 'redis://localhost:6379'

var dbinstance = levelup('foo', {
  db: redisdown,
  url: redisURL
})

dbinstance.put('name', 'LevelUP2', function (err) {
  if (err) return console.log('Ooops!', err) // some kind of I/O error

  // 3) fetch by key
  dbinstance.get('name', function (err, value) {
    if (err) return console.log('Ooops!', err) // likely the key was not found

    // ta da!
    console.log('name=' + value)
  })
})

// create a new lem store using the leveldb
var lemdb = lem(dbinstance)

// nodes are represented by keys
var key = 'myhouse.kitchen.fridge.temperature'

// index a node with some meta data
lemdb.index(key, 'My Fridge Temp')

// create a recorder which will write data to the node
var recorder = lemdb.recorder('myhouse.kitchen.fridge.temperature')

var timestamp = new Date().getTime()
console.log(util.inspect(lemdb._db, true, null))
// sample the value every second
recorder(50, timestamp, function () {
  dbinstance.close()
})
