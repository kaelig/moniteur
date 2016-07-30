require('babel-register')
require('babel-polyfill')

import debug from 'debug'
import program from 'commander'
import db from '../lib/db'
import Record from '../lib/record'
import nconf from 'nconf'
import compression from 'compression'
import express from 'express'
import path from 'path'
import lem from 'lem'
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

    app.use(function (req, res, next) {
      res.locals.config = app.locals.config
      res.locals.db = app.locals.db
      next()
    })

    app.use(compression())

    // JS Setup
    if (app.get('env') === 'development') {
      const webpack = require('webpack')
      const webpackDevMiddleware = require('webpack-dev-middleware')
      const webpackHotMiddleware = require('webpack-hot-middleware')
      const webpackConfig = require('../webpack.config')
      const bundler = webpack(webpackConfig)

      app.use(webpackDevMiddleware(bundler, {
        publicPath: '/js/',
        stats: { colors: true }
      }))
      app.use(webpackHotMiddleware(bundler, {
        log: console.log
      }))
    }

    // view engine setup
    app.set('views', path.join(__dirname, '../views'))
    app.set('view engine', 'pug')

    app.use('/js', express.static(path.join(__dirname, '../_dist/js')))
    app.use('/stylesheets', express.static(path.join(__dirname, '../client/stylesheets')))
    app.use('/docs', express.static(path.join(__dirname, '../docs')))


    app.use('/', require('../routes/index').default)
    app.use('/welcome', (req, res) => res.render('welcome', { title: 'moniteur: welcome' }))
    app.use('/support', (req, res) => res.render('welcome', { title: 'moniteur: support' }))
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

    if (app.get('env') === 'development') {
      // development error handler
      // will print stacktrace
      app.use(function (err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
          message: err.message,
          error: err
        })
      })
    } else {
      // production error handler
      // no stacktraces leaked to user
      app.use(function (err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
          message: err.message,
          error: {}
        })
      })
    }

    app.set('port', process.env.PORT || 3000)

    if (app.get('env') === 'development') {
      const browserSync = require('browser-sync')

      browserSync({
        server: {
          port: app.get('port'),
          baseDir: './',
          middleware: [app]
        },
        open: false,
        logFileChanges: false,
        notify: false,
        files: [
          'views/*.pug',
          'client/stylesheets/*.css'
        ]
      })
    } else {
      const server = app.listen(app.get('port'), () => {
        console.log('Express server listening on port ' + server.address().port)
        console.log('Open http://localhost:' + server.address().port)
      })
    }
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
