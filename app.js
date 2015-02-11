// Module Dependencies

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('client-sessions');
var fs = require('fs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var loginRoutes = require('./routes/loginRoutes');
var oathRoutes = require('./routes/oathRoutes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


// cookie session stuffs
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 10 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 10 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

app.use(passport.initialize());
//app.use(passport.session());

var User = require('./models/User');

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// for nodejitsu
var dbString = '';

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
    dbString = 'mongodb://localhost/Treasury';
}

mongoose.connect(dbString, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection to local DB successful');
    }
});

// for venmo OAuth


// for login sessions


// hard coded user values

var Venmo_Client_ID = '2360';
var Venmo_Client_SECRET = 'eakFc2jPuHjvZWe3ULGKsdB7Tg4kvEH3';
var Venmo_Callback_URL = 'http://localhost:3000/auth/venmo/callback';



// handles cookie auth, session vars
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ email: req.session.user.email }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.salt; // delete the password from the session
        delete req.user.hash;
        req.session.user = req.user;  //refresh the session value
        res.locals.user = user;
      }
      next();
    });
  } else {

    next();
  }
});

app.use('/', loginRoutes);
app.use('/auth', oathRoutes);

function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
};


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers



// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;