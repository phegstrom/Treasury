var router = require('express').Router();
var User = require('../models/User');
var Charge = require('../models/Charge');
var Transaction = require('../models/Transaction');
var request = require('request');
var async = require('async');
var config = require('../config/index');

var BASE_URL = config.Venmo_BASE_URL;

// webhook verification route, venmo uses this to verify webhook url
router.get('/', function (req, res, next) {
	console.log('VERIFYING WEBHOOK');
	if (req.query.venmo_challenge) {
		console.log(req.query.venmo_challenge);
		console.log('webhook established!');
		res.status(200).send(req.query.venmo_challenge);
	}

	console.log('WEBHOOK TEST');
	console.log(req.body);
	
});

// webhook endpoint, venmo sends updates here
router.post('/', function (req, res, next) {
	console.log('received webhook from venmo server...');
	console.log(req.body);
	console.log(typeof req.body);

	// var hook = JSON.parse(req.body);
	var hook = req.body
	console.log('date type');
	console.log(typeof hook.date_created);
	if (hook.type == 'payment.updated') {
		if (hook.data.status == 'settled') {
			var transactionID = hook.data.id;
			var webhook = hook.data;

			async.waterfall([
				// find transaction based on webhook info
				function (next) {
					Transaction.findOne({paymentId: transactionID}, function (err, trans) {
						var d = new Date(webhook.date_completed);
						trans.dateCompleted = d;
						trans.status = 'settled';
						console.log("TRANSACTION");
						console.log(trans);
						console.log(webhook.status);
						trans.save(function (err, saved) {
							if (err) console.log(err);
							next(err, saved.charge);
						});
					});	
				},
				// now update charge in database
				function (chargeId, next) {
					Charge.findOne({_id: chargeId}, function (err, charge) {
						charge.totalReceived += charge.individualTotal;
						charge.save(function (err, saved) {
							next(null);
						});
					});
				}, 
				// update users total
				function () {					
					User.findOne({_id: req.session.user._id}, function (err, user) {
						var body = {access_token: user.access_token};
						var qString = 'access_token=' + user.access_token;
						request.get('https://api.venmo.com/v1/me?' + qString, function (err, resp, receipt) {
							console.log('received Venmo ME response...');
							receipt = JSON.parse(receipt);
							user.myBalance = receipt.data.balance;
							user.save(function (err, saved) {
								res.status(200).send('webhook processed!');
							});
						});
					});
				}
			]);

		}
	}

	res.status(200).send('received webhook');
});

module.exports = router;