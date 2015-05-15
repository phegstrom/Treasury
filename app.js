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
var request = require('request');

var config = require('./config/index'); // require in config main file

// importing route files
var loginRoutes = require('./routes/loginRoutes');
var oathRoutes = require('./routes/oathRoutes');
var usergroupRoutes = require('./routes/usergroupRoutes');
var chargeRoutes = require('./routes/chargeRoutes');
var webhookRoutes = require('./routes/webhookRoutes');

var app = express();
console.log('');

// view engine setup
app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'app')));



// cookie session stuffs
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 10 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 10 * 60 * 1000, // extended value (here initial will be 10 + 10 min)
  cookie: {
      ephemeral: true, // when true, cookie expires when the browser closes
      httpOnly: true, // when true, cookie is not accessible from javascript
      secure: false // can't be true if using LOCALHOST
    }
}));

app.use(passport.initialize());
app.use(passport.session());

var User = require('./models/User');

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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

mongoose.connect(config.db_URL, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection to DB successful');
    }
});

// handles cookie auth, session vars for EVERY request

app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ email: req.session.user.email }, function(err, user) {
      if (user) {
        req.user = user;
        req.session.user = req.user;  //refresh the session value
        res.locals.user = user;
      } 
      next();

    });
  } else {
    next();
  }
});

// handles if need to refresh access token
// app.use(function (req, res, next) {
//   if (req.session && req.session.user) {
//     User.findOne({ email: req.session.user.email }, function(err, user) {
//       if (user) {
//         var d = new Date();
//         if (d > user.tokenExpireDate) {  // if token has expire
//           refreshAccessToken(req, function (receipt) {
//             user.access_token = receipt.access_token;
//             user.refresh_token = receipt.refresh_token;
//             user.tokenExpireDate = getExpireDate(receipt.expires_in);
//             user.save(function (err, saved) {
//               next();
//             });
//           });
//         }
//       } 
//       next();
//     });
//   } else {
//     next();
//   }
// });

// app.use(function (req, res, next) {
//     if (req.session && req.session.user) {
//       User.findOne({ email: req.session.user.email }, function(err, user) {
//         if (user) {
//           var d = new Date();
//           if (!user.access_token || d > user.tokenExpireDate) {
//             user.isConnected = false;
//           }
//         } 
//         next();

//       });
    
//   } else {
//     next();
//   }
// });


// load route middleware
app.use('/', loginRoutes);
app.use('/auth', requireLogin, oathRoutes);
app.use('/usergroup', usergroupRoutes);
// app.use('/charge', requireLogin, chargeRoutes);
app.use('/charge', chargeRoutes); //requireLogin if not for testing RYAN
app.use('/webhook', webhookRoutes);


// ADD postManTest to app.use() line
// insert specific user id here when testing with POSTman
function postMANTest(req, res, next) {
  req.session = {user: {_id: "54dadb440f91335218191cb1",
                        access_token: '9935b8cd1a9c0ab5c2c5ed7a2f285316a4f38fb565832045c1c1d2a2e236e708'}};
  next();
}


function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

// NEED TO FIND CORRECT URL TO PING
// function refreshAccessToken(req, cb) {

//   var body = {
//     client_id: config.Venmo_Client_ID,
//     client_secret: config.Venmo_Client_SECRET,
//     refresh_token: req.session.user.refresh_token
//   };

//   request.post(config.Venmo_BASE_URL, {form: body}, function (err, resp, receipt) {
//     receipt = JSON.parse(receipt);
//     cb(receipt);
//   });
// };

function getExpireDate(secondCount) {
  var myD = new Date()
  var daysToExpire = secondCount / (60 * 60 * 24);
  myD.setDate(myD.getDate() + daysToExpire);
  return myD
}


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
