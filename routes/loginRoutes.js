var passport = require('passport');
var User = require('../models/User');
var UserGroup = require('../models/UserGroup');
var router = require('express').Router();


router.get('/', requireLogin, function(req, res, next) {
  User.findOne({_id: req.session.user._id}, 'userGroups')
    .populate('userGroups')
    .exec(function (err, user) {  
      res.render('dashboard', {user: req.session.user, usergroupList: JSON.stringify(user.userGroups)});    
    });  
});


router.get('/register', function(req, res) {
  res.render('register', {});
});

router.post('/register', function(req, res, next) {
  console.log('registering user');
  User.register(new User({ name: req.body.name, email: req.body.email, isConnected: false}), req.body.password, function(err, acc) {
    if (err) { console.log('error while user register!', err); return next(err); }
    res.redirect('/login');
  });
});

router.get('/login', function(req, res) {
  res.render('login', { user: req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  req.session.user = req.user;
  res.redirect('/');
});

router.get('/logout', function(req, res) {
  req.session.reset();
  req.logout();
  res.redirect('/login');
});

router.get('/query', function(req, res) {
  User.find(function(err, users) {
    res.send(users);
  });
});


function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

module.exports = router;