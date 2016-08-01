require('babel-register')
require('babel-polyfill')

import debug from 'debug'
import program from 'commander'
import db from '../lib/db'
import Record from '../lib/record'
import nconf from 'nconf'
import compression from 'compression'
import express from 'express'
import slash from 'express-slash'
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
    app.set('strict routing', true)
    const router = express.Router({
      caseSensitive: app.get('case sensitive routing'),
      strict: app.get('strict routing')
    })
    app.use(compression())
    app.use(router)
    app.use(slash())

    const dbinstance = db(nconf.get('db'))

    router.use((req, res, next) => {
      res.locals.assets = nconf.get('assets')
      res.locals.db = dbinstance
      next()
    })

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

    router.use('/js', express.static(path.join(__dirname, '../_dist/js')))
    router.use('/stylesheets', express.static(path.join(__dirname, '../client/stylesheets')))
    router.use('/docs', express.static(path.join(__dirname, '../docs')))

    router.use('/', require('../routes/index').default)
    router.get('/welcome/', (req, res) => res.render('welcome', { title: 'moniteur: welcome' }))
    router.get('/support/', (req, res) => res.render('support', { title: 'moniteur: support' }))
    router.use('/metrics', require('../routes/metrics').default)
    app.use('/settings/', require('../routes/settings').default)
    router.get('/assets.json', (req, res, next) => {
      res.type('application/json')
      res.send(JSON.stringify(res.locals.assets, null, 2))
      next()
    })

    // Hide from crawlers
    router.get('/robots.txt', (req, res) => {
      res.type('text/plain')
      res.send('User-agent: *\nDisallow: /')
    })

    // Catch 404 and forward to error handler
    app.use((req, res, next) => {
      let err = new Error('Not Found')
      err.status = 404
      next(err)
    })

    // Error handlers
    if (app.get('env') === 'development') {
      // development error handler
      // will print stacktrace
      app.use((err, req, res, next) => {
        res.status(err.status || 500)
        res.render('error', {
          message: err.message,
          error: err
        })
      })
    } else {
      // production error handler
      // no stacktraces leaked to user
      app.use((err, req, res, next) => {
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
      app.listen(app.get('port'))
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
