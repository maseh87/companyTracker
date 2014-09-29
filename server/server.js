var express    = require('express'),
    app        = express(),
    bodyparser = require('body-parser'),
    mongoose   = require('mongoose'),
    morgan     = require('morgan'),
    passport   = require('passport'),
    github    = require('passport-github').Strategy,
    jsonWT     = require('jsonwebtoken'),
    jwt        = require('express-jwt'),
    cookieParser = require('cookie-parser');


mongoose.connect('mongodb://localhost/weaknessjs');

passport.use(new github({
  clientID: process.env.GH_CLIENT_ID,
  clientSecret: process.env.GH_CLIENT_SECRET
}, function(token, tokenSecret, profile, done) {
  //need to save tokens also in case I need to go back to github in the future
  //need to find or create a user based on the profile I received from github
  //call the done function to end this and attach the profile to the req.user
  done(null, profile);
}));


var todos = [];
var id = 0;
var users = {};



app.use(morgan('dev'));
app.use(express.static(__dirname + '/../client'));
app.use(cookieParser());
app.use(bodyparser.json());
app.use(passport.initialize());



//auth route for github
app.get('/github', passport.authenticate('github', {
  session: false
}));
//github call url I specified in my github profile
app.get('/github/callback', passport.authenticate('github', {
  session: false
}), function(req, res) {
  var token = jsonWT.sign({id: req.user.id}, process.env.TOKEN_SECRET, {});
  // console.log(token, ' token');
  res.cookie('todos', JSON.stringify(token));
  //call the close window route to close the pop up window
  res.redirect('/closeWindow');
});

app.get('/todos', function(req, res, next) {
  res.send(todos);
});

app.post('/todos', function(req, res, next) {
  req.body.id = id;
  id++;
  todos.push(req.body);
  res.send(req.body);
});

app.delete('/todos/:id', function(req, res, next) {
  for(var i = 0; i < todos.length; i++) {
    if(todos[i].id === parseInt(req.params.id)) {
      var id = todos[i].id;
      todos.splice(i, 1);
      res.send({id: id});
    }
  }
});

app.put('/todos', function(req, res, next) {
  for(var i = 0; i < todos.length; i++) {
    if(todos[i].id === req.body.id) {
      todos[i].todo = req.body.todo;
      res.send(todos);
    }
  }
});

//route for logging in
app.post('/login', function(req, res, next) {
  if(req.body.username in users && req.body.password === users[username]) {
    res.send(200);
  } else {
    res.send(401);
  }
});

//route to signout
app.post('/signout', function(req, res, next) {

});

//route to get called after authenticating with github
app.get('/closeWindow', function(req, res, next ) {
  res.sendFile(__dirname + '/close.html');
});

//export the app function to require in index.js
module.exports = app;