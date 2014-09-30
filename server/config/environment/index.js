'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

var defaults = {
  env: process.env.NODE_ENV,

  //Root path to the server
  root: path.normalize(__dirname + '/../../..'),

  port: process.env.PORT || 9000,

  seedDB: false,

  userRoles: ['guest', 'user', 'admin'],

  secrets: {
    jwt: process.env.JWT_SECRET
  },

  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  twitter: {
    clientID: process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },

  google: {
    clientID: process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/google/callback'
  }
};

module.exports = _.merge(defaults, require('./' + process.env.NODE_ENV + '.js') || {});