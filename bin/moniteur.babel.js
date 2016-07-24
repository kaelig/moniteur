var debug = require('debug')
var log = debug('moniteur:log')
var program = require('commander')

var config = require('../lib/config')
var db = require('../lib/db')
import Record from '../lib/record'

program
  .version(require('../package.json').version)
  // Extend default config when --config is specified
  .option('-c, --config [path]', 'specify a configuration file')

program
  // TODO: Uncomment description when issue https://github.com/tj/commander.js/issues/285
  // is merged via https://github.com/tj/commander.js/pull/286
  .command('record'/*, 'record a snapshot of all asset metrics'*/)
  .action(function () {
    config = config(program.config)
    var dbinstance = db(config.db)
    var record = new Record(
      config,
      dbinstance
    )

    record.init()

    Promise.all(record.recordDataPoints()).then(function (data) {
      log('DataPoints:', JSON.stringify(data, null, 4))
      return dbinstance.close()
    })
  })

program
  .command('serve'/*, 'see assets sensor graphs in the browser'*/)
  .action(function () {
    config = config(program.config)
    var app = require('../server.babel')(config, db(config.db))

    app.set('port', process.env.PORT || 3000)

    var server = app.listen(app.get('port'), function () {
      console.log('Express server listening on port ' + server.address().port)
      if (app.get('env') === 'development') {
        console.log('Open http://localhost:' + server.address().port)
      }
    })
  })

program
  .command('showconfig'/*, 'return the full config'*/)
  .action(function () {
    config = config(program.config)
    return console.log(config)
  })

program.parse(process.argv)
