var passport = require('passport');
var VenmoStrategy = require('passport-venmo').Strategy;
var request = require('request')
var router = require('express').Router();

// from developers tab in venmo for this application
var Venmo_Client_ID = '2360';
var Venmo_Client_SECRET = 'eakFc2jPuHjvZWe3ULGKsdB7Tg4kvEH3';
var Venmo_Callback_URL = 'http://localhost:3000/auth/venmo/callback';


router.get('/', function (req, res, next) {
	var scopes = ['make_payments', 'access_profile', 'access_email', 'access_phone', 'access_balance'];
	var urlString = createURLString(Venmo_Client_ID, scopes);
	res.redirect(urlString);
});

router.get('/venmo/callback', function (req, res, next) {
	if (req.query.error) res.redirect('/'); // if user denies access
	request.post('https://api.venmo.com/v1/oauth/access_token', 
		{form: {    client_id: Venmo_Client_ID,
    				client_secret: Venmo_Client_SECRET,
    				code: req.query.code}}, 
		function(e, r, venmo_receipt) {
			console.log("AUTHENTICATED");
			console.log(venmo_receipt);
			res.send(venmo_receipt);
		});
});	

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