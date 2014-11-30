var browserify = require('browserify-middleware');
var express = require('express');
var debug = require('debug');
var log = debug('app:log');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./lib/config');

var app = express();

module.exports = function(config, db) {
  app.locals.config = config;
  app.locals.db = db;
  log(app.locals.config);

  if (process.env.NODE_ENV !== 'development') {
    var compress = require('compression');
    app.use(compress());
  }

  app.use(function(req, res, next) {
    res.locals.config = app.locals.config;
    res.locals.db = app.locals.db;
    next();
  });

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // uncomment after placing your favicon in /public
  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/bower_components',  express.static(__dirname + '/bower_components'));
  app.use('/node_modules',  express.static(__dirname + '/node_modules'));

  //provide browserified versions of all the files in a directory
  app.use('/js', browserify(__dirname + '/public/javascripts'));

  app.use('/', require('./routes/index'));
  app.use('/metrics', require('./routes/metrics'));
  app.use('/config', require('./routes/config'));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    // app.locals = res.locals;
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

  return app;
};
