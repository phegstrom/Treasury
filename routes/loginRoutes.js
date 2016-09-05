var passport = require('passport');
var User = require('../models/User');
var UserGroup = require('../models/UserGroup');
var _ = require('underscore');
var router = require('express').Router();


router.get('/', requireLogin, function(req, res, next) {
  User.findOne({_id: req.session.user._id})
    .populate('userGroups')
    .deepPopulate('myCharges.transactions.group')
    .exec(function (err, user) {

      // send existing data to client for initial rendering
      console.log('sending pre-existing data from server...');
      var orderedChargeList = user.myCharges;
      orderedChargeList = _.sortBy(orderedChargeList, 'dateCreated');
      orderedChargeList.reverse();

      var objToSend = {
                        user: req.session.user,
                        usergroupList: JSON.stringify(user.userGroups),
                        chargeList: JSON.stringify(orderedChargeList),
                      }

      res.render('dashboard', objToSend);    
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

// Checks if user is logged in or if cookie has expired.
// If so, will redirect to login page
function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

module.exports = router;