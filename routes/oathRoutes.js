var passport = require('passport');
var VenmoStrategy = require('passport-venmo').Strategy;
var request = require('request')
var router = require('express').Router();

// router.get('/', function (req, res, next) {
// 	var Venmo_Client_ID = '2360';
// 	var Venmo_Client_SECRET = 'eakFc2jPuHjvZWe3ULGKsdB7Tg4kvEH3';
// 	var Venmo_Callback_URL = 'http://localhost:3000/auth/venmo/callback';

// 	var urlString = 'http://api.venmo.com/v1/oauth/authorize?client_id='+Venmo_Client_ID+
// 	'&scope=make_payments%20access_profile%20access_email%20access_phone%20access_balance&response_type=code&redirect_uri='+Venmo_Callback_URL;
// 	res.redirect(urlString);
// });

var Venmo_Client_ID = '2360';
var Venmo_Client_SECRET = 'eakFc2jPuHjvZWe3ULGKsdB7Tg4kvEH3';
var Venmo_Callback_URL = 'http://localhost:3000/auth/venmo/callback';

passport.use(new VenmoStrategy({
    clientID: Venmo_Client_ID,
    clientSecret: Venmo_Client_SECRET,
    callbackURL: Venmo_Callback_URL
  },
  function(accessToken, refreshToken, venmo, done) {
  	console.log("venmo output");
    console.log(venmo);
    console.log("AUTHENTICATED");
    //console.log(req.session.user);
    // User.findOne({_id: req.session.user._id}).exec(function (err, user) {
    // 	return done(err, user);
    // });
    // User.findOne({
    //     'venmo.id': venmo.id
    // }, function(err, user) {
    //     if (err) {
    //         return done(err);
    //     }
    //     // checks if the user has been already been created, if not
    //     // we create a new instance of the User model
    //     if (!user) {
    //         user = new User({
    //             name: venmo.displayName,
    //             username: venmo.username,
    //             email: venmo.email,
    //             provider: 'venmo',
    //             venmo: venmo._json,
    //             balance: venmo.balance,
    //             access_token: accessToken,
    //             refresh_token: refreshToken
    //         });
    //         user.save(function(err) {
    //             if (err) console.log(err);
    //             return done(err, user);
    //         });
    //     } else {
    //         user.balance = venmo.balance;
    //         user.access_token = accessToken;
    //         user.save();
    //         user.venmo = venmo._json
    //         return done(err, user);
    //     }
    // });
	return done (null, null);
  }
));

router.get('/', passport.authenticate('venmo', {
    scope: ['make_payments', 'access_feed', 'access_profile', 'access_email', 'access_phone', 'access_balance', 'access_friends'],
    failureRedirect: '/'
}),  signin);

function signin(req, res) {
	console.log("SIGN IN");
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};

router.get('/venmo/callback', passport.authenticate('venmo', {
    failureRedirect: '/'
}), function (req, res, next) {
	console.log("HEHEHEHEHEHEH");
	console.log(req.session.user);
	res.redirect('/');
});

// //old
// router.get('/venmo/callback', function (req, res, next) {
	
// 	res.send(req.query);
// });	


module.exports = router;