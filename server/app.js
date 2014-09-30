'use strict';

//Default to dev
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express       = require('express');
var mongoose      = require('mongoose');
var config        = require('./config/environment');


//connect to DB here
mongoose.connect(config.mongo.uri);

//Populate DB with sample data
if (config.seedDB) { require('./config/seed'); }

var app = express();

//Start server
app.listen(config.port, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app for testing and other things
exports = module.exports = app;