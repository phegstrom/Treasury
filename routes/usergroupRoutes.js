var passport = require('passport');
var VenmoStrategy = require('passport-venmo').Strategy;
var request = require('request')
var router = require('express').Router();
var User = require('../models/User');

// from developers tab in venmo for this application


// create a user group
router.post('/', function (req, res, next) {
	
});


module.exports = router;