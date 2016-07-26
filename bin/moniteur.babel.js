import debug from 'debug'
import program from 'commander'
import db from '../lib/db'
import Record from '../lib/record'
import nconf from 'nconf'
import compression from 'compression'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import babelify from 'express-babelify-middleware'
import path from 'path'
import lem from 'lem'
import logger from 'morgan'
import yaml from 'js-yaml'
nconf.formats.yaml = require('nconf-yaml')

const log = debug('moniteur:log')

program
  .version(require('../package.json').version)

nconf
  .env({
    separator: '__',
    lowerCase: true,
    whitelist: ['REDISCLOUD_URL', 'REDIS_URL', 'NODE_ENV', 'DB__REDIS_URL']
  })
  .argv()

nconf
  .file('development', { file: path.join(__dirname, '/../.moniteurrc.development.yml'), format: nconf.formats.yaml })
  .file('user', { file: path.join(__dirname, '/../.moniteurrc.yml'), format: nconf.formats.yaml })
  .file('default', { file: path.join(__dirname, '/../.moniteurrc.default.yml'), format: nconf.formats.yaml })

nconf
  .set('assets', process.env.ASSETS ? yaml.safeLoad(process.env.ASSETS) : nconf.get('assets'))

// nconf evaluates the : in the protocol as a key:value pair
// so we're restoring the colon in the URL protocols
nconf
  .set('db:redis_url',
    process.env.REDIS_URL ? process.env.REDIS_URL.replace(/redis\/\//, 'redis://')
    : (process.env.REDISCLOUD_URL ? process.env.REDISCLOUD_URL.replace(/redis\/\//, 'redis://')
      : (nconf.get('db:redis_url') ? nconf.get('db:redis_url').replace(/redis\/\//, 'redis://')
        : null)))

program
  .command('record')
  .description('record a snapshot of all asset metrics')
  .action((cmd, env) => {
    log(nconf.get('assets'))
    log(nconf.get('db'))
    const dbinstance = db(nconf.get('db'))

    const record = new Record(nconf.get('assets'), lem(dbinstance))
    return Promise.all(record.init()).then((data) => {
      return Promise.all(record.recordDataPoints()).then((data) => {
        dbinstance.close()
        return log('DataPoints:', JSON.stringify(data, null, 4))
      }, (reason) => console.log(reason))
    }, (reason) => console.log(reason))
  })

program
  .command('serve')
  .description('start the server to show metrics in the browser')
  .action(() => {
    const app = express()

    app.locals.config = {}
    app.locals.config.assets = nconf.get('assets')
    app.locals.db = db(nconf.get('db'))
    log(app.locals.db)

    app.use(compression())

    app.use(function (req, res, next) {
      res.locals.config = app.locals.config
      res.locals.db = app.locals.db
      next()
    })

    // view engine setup
    app.set('views', path.join(__dirname, '../views'))
    app.set('view engine', 'pug')

    app.use(logger('dev'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(cookieParser())
    app.use(express.static(path.join(__dirname, '../public')))
    app.use('/docs', express.static(path.join(__dirname, '../docs')))
    app.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery')))

    app.use('/js', babelify(path.join(__dirname, '../public/javascripts')))

    app.use('/', require('../routes/index').default)
    app.use('/welcome', require('../routes/welcome').default)
    app.use('/metrics', require('../routes/metrics').default)
    app.use('/settings', require('../routes/settings').default)
    app.use('/assets.json', (req, res, next) => {
      res.type('application/json')

      // Conceal database configuration settings from the public
      res.send(JSON.stringify(nconf.get('assets'), null, 2))
    })

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      let err = new Error('Not Found')
      err.status = 404
      next(err)
    })

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
      app.use(function (err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
          message: err.message,
          error: err
        })
      })
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
      res.status(err.status || 500)
      res.render('error', {
        message: err.message,
        error: {}
      })
    })

    app.set('port', process.env.PORT || 3000)

    const server = app.listen(app.get('port'), () => {
      console.log('Express server listening on port ' + server.address().port)
      if (app.get('env') === 'development') {
        console.log('Open http://localhost:' + server.address().port)
      }
    })
  })

program
  .command('assets')
  .description('display the list of assets loaded by moniteur')
  .action(() => {
    return console.log(nconf.get('assets'))
  })

program.command('help', null, {isDefault: true})
  .description('display this helpful message')
  .action(() => {
    program.outputHelp()
  })

program.command('*', null, {noHelp: true})
  .action(function (cmd) {
    console.error(`${cmd} is not a moniteur command. See usage below`)
    program.outputHelp()
  })

program.parse(process.argv)
