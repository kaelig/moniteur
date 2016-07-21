var express = require('express')
var babelify = require('express-babelify-middleware')
var debug = require('debug')
var log = debug('app:log')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
import _ from 'lodash'

var app = express()

module.exports = function (config, db) {
  app.locals.config = config
  app.locals.db = db
  log(app.locals.config)

  if (process.env.NODE_ENV !== 'development') {
    var compress = require('compression')
    app.use(compress())
  }

  app.use(function (req, res, next) {
    res.locals.config = app.locals.config
    res.locals.db = app.locals.db
    next()
  })

  // view engine setup
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))
  app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')))

  app.use('/js', babelify(path.join(__dirname, 'public/javascripts')))

  app.use('/', require('./routes/index'))
  app.use('/metrics', require('./routes/metrics'))
  app.use('/config', (req, res, next) => {
    res.type('application/json')

    // Conceal database configuration settings from the public
    const config = _.omit(res.locals.config, 'db')

    res.send(JSON.stringify(config, null, 2))
  })

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found')
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

  return app
}
