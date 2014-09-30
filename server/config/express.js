'use strict';

var express       = require('express'),
    favicon       = require('serve-favicon'),
    morgan        = require('morgan'),
    compression   = require('compression'),
    bodyParser    = require('body-parser'),
    mOverride     = require('method-override'),
    cookieParser  = require('cookie-parser'),
    errorHandler  = require('errorhandler'),
    path          = require('path'),
    config        = require('./environment'),
    passport      = require('passport'),
    session       = require('express-session'),
    mongoStore    = require('connect-mongo')(session),
    mongoose      = require('mongoose');


exports = module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded( {extended: true } ));
  app.use(bodyParser.json());
  app.use(mOverride());
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(express.static(path.join(config.root, 'bower_components')));
  // I have to use sessions to authorize with twitter
  app.use(session({
    secret: config.secrets.session,
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({mongoose_connection: mongoose.connection})
  }));

  if('production' === env) {
    app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', config.root + '/client');
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', 'client');
    app.use(morgan('dev'));
    app.use(errorHandler()); //make sure this is last
  }
};