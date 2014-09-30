'use strict';
var errors = require('./components/errors');

exports = module.exports = function(app) {

  app.use('/api/users', require('./api/user'));
  app.use('/auth', require('./auth'));
  // Direct to 404 Page if route doesn't exist
  app.route('/*(api|auth|fonts|images|scripts|styles|bower_components|)/*')
    .get(errors[404]);
  // All other routes should direct to the index.html
  app.route('/*')
    .get(function(req, res) {
      console.log('_____here_____');
      res.sendFile(app.get('appPath') + '/index.html');
    });
};