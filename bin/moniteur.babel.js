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
import logger from 'morgan'
nconf.formats.yaml = require('nconf-yaml')

const log = debug('moniteur:log')

program
  .version(require('../package.json').version)
  .option('-c, --config', 'set config path')

nconf
  .env({
    separator: '__',
    lowerCase: true,
    whitelist: ['redis_url']
  })
  .argv({
    'c': {
      alias: 'config',
      describe: 'set config path'
    }
  })

if (process.env.REDIS_URL) {
  nconf.set('db:redis_url', process.env.REDIS_URL)
}

if (process.env.NODE_ENV !== 'production') {
  nconf.file('override', { file: './.moniteurrc.development.yml', format: nconf.formats.yaml })
}
if (nconf.get('config')) {
  nconf.file('override', { file: nconf.get('config'), format: nconf.formats.yaml })
}

nconf
  .file('user', { file: './.moniteurrc.yml', format: nconf.formats.yaml })
  .file('default', { file: './.moniteurrc.defaults.yml', format: nconf.formats.yaml })


// Transform:
// http://foo.com/asset.js,http://bar.com/asset.js
// Into:
// {
//   http://foo.com/asset.js: "http://foo.com/asset.js",
//   http://bar.com/asset.js: "http://bar.com/asset.js"
// }
if (process.env.ASSETS) {
  nconf.clear('assets')
  nconf.set('assets', process.env.ASSETS.split(',').reduce((assets, asset) => {
    const [key, ...url] = asset.split(':')
    assets[key] = url.join('')
      // Semicolons are considered as separators by nconf
      // So they're stripped from URLs
      .replace(/http(s?)\/\//, 'http$1://')
    return assets
  }, {}))
}

program
  .command('record')
  .description('record a snapshot of all asset metrics')
  .action((cmd, env) => {
    log(nconf.get('assets'))
    const record = new Record(nconf.get('assets'), db(nconf.get('db')))
    record.init()

    Promise.all(record.recordDataPoints()).then((data) => {
      log('DataPoints:', JSON.stringify(data, null, 4))
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

    if (process.env.NODE_ENV !== 'development') {
      app.use(compression())
    }

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
    app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')))

    app.use('/js', babelify(path.join(__dirname, '../public/javascripts')))

    app.use('/', require('../routes/index').default)
    app.use('/metrics', require('../routes/metrics').default)
    app.use('/config', (req, res, next) => {
      res.type('application/json')
      // Conceal database configuration settings from the public
      const publicConfig = Reflect.deleteProperty(res.locals.config, 'db')

      res.send(JSON.stringify(publicConfig, null, 2))
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
