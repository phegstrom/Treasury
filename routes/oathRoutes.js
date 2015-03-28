var passport = require('passport');
var VenmoStrategy = require('passport-venmo').Strategy;
var request = require('request')
var router = require('express').Router();
var querystring = require('querystring');
var User = require('../models/User');

var config = require('../config/index');

// from config file
var Venmo_Client_ID = config.Venmo_Client_ID;
var Venmo_Client_SECRET = config.Venmo_Client_SECRET;
var Venmo_Callback_URL = config.Venmo_Callback_URL;


router.get('/', function (req, res, next) {
	var url = config.Venmo_Auth_URL;
	var scopeString = config.Venmo_scopeString;

	var qString = {client_id: Venmo_Client_ID, scope: scopeString, response_type: 'code'};

	res.redirect(url + querystring.stringify(qString));
});


// venmo redirect URL issues GET request here with code=secretCode
router.get('/venmo/callback', function (req, res, next) {
	if (req.query.error) res.redirect('/'); // if user denies access
	request.post(config.Venmo_Auth_ACCESSTOKEN_URL, 
		{form: {    client_id: Venmo_Client_ID,
    				client_secret: Venmo_Client_SECRET,
    				code: req.query.code}}, 
		function(err, httpResponse, receipt) {
			console.log("USER AUTHENTICATED");
			console.log(receipt);

			
			User.findOne({_id: req.session.user._id}).exec(function (err, userT){
				if (err) next(err);
				receipt = JSON.parse(receipt);

				// pull venmo info from response body, store to DB
				userT.venmo_username = receipt.user.username;
				userT.venmoEmail = receipt.user.email;
				userT.access_token = receipt.access_token;
				userT.refresh_token = receipt.refresh_token;
				userT.myBalance = receipt.balance;		
				userT.venmo_id = receipt.user.id;
				userT.tokenExpireDate = getExpireDate(receipt.expires_in);

				userT.save(function (err, saved) {
					res.redirect('/');
				});
				
			});
			
		});
});	

function getExpireDate(secondCount) {
	var myD = new Date()
	var daysToExpire = secondCount / (60 * 60 * 24);
	myD.setDate(myD.getDate() + daysToExpire);
	return myD
}



module.exports = router;