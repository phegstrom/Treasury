var passport = require('passport');
var VenmoStrategy = require('passport-venmo').Strategy;
var request = require('request')
var router = require('express').Router();
var User = require('../models/User');

// from developers tab in venmo for this application
var Venmo_Client_ID = '2360';
var Venmo_Client_SECRET = 'eakFc2jPuHjvZWe3ULGKsdB7Tg4kvEH3';
var Venmo_Callback_URL = 'http://localhost:3000/auth/venmo/callback';


router.get('/', function (req, res, next) {
	var scopes = ['make_payments', 'access_profile', 'access_email', 'access_phone', 'access_balance'];
	var urlString = createURLString(Venmo_Client_ID, scopes);
	res.redirect(urlString);
});


// venmo redirect URL issues GET request here with code=secretCode
router.get('/venmo/callback', function (req, res, next) {
	if (req.query.error) res.redirect('/'); // if user denies access
	request.post('https://api.venmo.com/v1/oauth/access_token', 
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

// creates URL string to redirect to venmo
function createURLString(id, scopes) {
	var toRet = 'http://api.venmo.com/v1/oauth/authorize?client_id=';
	toRet += (id + '&scope=');
	for (var i = 0; i < scopes.length; i++) {
		toRet += scopes[i]+'%20';
	}
	toRet += '&response_type=code';
	return toRet;
}


module.exports = router;