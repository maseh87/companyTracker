'use strict';

//Default to dev
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express       = require('express'),
    app           = express(),
    mongoose      = require('mongoose'),
    config        = require('./config/environment'),


//connect to DB here
mongoose.connect(config.mongo.uri);

//Populate DB with sample data
if (config.seedDB) { require('./config/seed'); }


//Start server
// app.listen()

// Expose app for testing and other things
exports = module.exports = app;