'use strict';

exports = module.exports = {
  //server ip
  ip: process.env.IP || undefined,

  //server port
  port: process.env.PORT || 8080,
  // Mongo connection info
  mongo: {
    uri: process.env.MONGOHQ_URL ||
         process.env.MONGOLAB_URI ||
         'mongodb://localhost/companyTracker'
  }
};