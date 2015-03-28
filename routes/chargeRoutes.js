var router = require('express').Router();
var User = require('../models/User');
var Charge = require('../models/Charge');
var UserGroup = require('../models/UserGroup');
var Transaction = require('../models/Transaction');
var mongoose	= require('mongoose');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var config = require('../config/index');

var BASE_URL = config.Venmo_BASE_URL;
	
// return array of charges for a given user
router.get('/', function (req, res, next) {
	User.findOne({_id: req.session.user._id})
		.deepPopulate('myCharges.transactions.group')
		.exec(function (err, user) {		
			res.send(user.myCharges);
		});
});



// webhook endpoint used by venmo to send updates to our app
router.get('/webhook', function (req, res, next) {
	console.log('TESTING WEBHOOK');
	if (req.query.venmo_challenge) {
		console.log(req.venmo_challenge);
		console.log('webhook established!');
		res.send(req.query.venmo_challenge);
	}
	
});

// creates a charge in the system
router.post('/', function (req, res, next){
	var desc = req.body.description;
	var indTotal = req.body.individualTotal;
	var groups = req.body.groupIDs;

	var uid = req.session.user._id;

	var charge = new Charge({							
							description: desc, 
							individualTotal: indTotal, 
							totalReceived: 0,
							myGroups: groups
							});
	
	UserGroup.getMemberCount(groups, function (err, memberCount, phoneArray) {
		
		charge.total = memberCount * indTotal;
		charge.save(function (err, saved) {

			User.findOneAndUpdate({_id: uid}, {$push: {myCharges: saved._id}}, function (err, numAffected) {
				req.charge = saved.toJSON();
				req.charge.phoneNumbers = phoneArray;
				next(); // now ping venmo server				
			});

		});
	});
});


// part of the route that issues the requests
// req.charge holds the charge json object
router.post('/', function (req, res, next){
	console.log('issuing charges to venmo api...');
	var fnArray = createWaterfallArray(req);

	// var transactionIds = [];

	// final function in waterfall
	var f = function (transactionIds) {
		Charge.findOneAndUpdate({_id: req.charge._id}, {$pushAll: {transactions: transactionIds}}, function (err, charge){
			console.log('finalized charges!!');
			res.send(charge);
		}); 
	};

	fnArray.push(f);
	console.log('here');
	async.waterfall(fnArray);

});


function createWaterfallArray(req) {
	var funcArray = [];
	var charge = req.charge;
	var numbers = charge.phoneNumbers;
	var transIds = [];

	for (var i = 0; i < numbers.length; i++) {

		var body = {
			access_token: req.session.user.access_token,
			phone: numbers[i].phoneNumber, // COMES FROM PHONE ARRAY
			note: charge.description, // req.charge.description
			amount: charge.individualTotal, // req.charge.individualTotal
			audience: charge.audience// req.charge.audience
		};		

		var f;

		if (i == 0) {
			f = createFirstFunctionInArray(charge, body, i, transIds);
		} else {
			f = createOtherFunctionInArray(charge, body, i);
		}
		
		funcArray.push(f);

	}

	return funcArray;



};

// creates first venmo_charge function to send in waterfall
function createFirstFunctionInArray(charge, venmoBody, index, transactionIds) {

	var f = function(next) {

		request.post(BASE_URL, {form: venmoBody}, function (err, resp, receipt) {
			console.log('received Venmo response ' + index);
			receipt = JSON.parse(receipt);
			

			var transactionObject = {
				phoneNumber: charge.phoneNumbers[index].phoneNumber,
				paymentId: receipt.data.payment.id,
				note: receipt.data.payment.note,
				status: receipt.data.payment.status, // should be pending
				dateCreated: receipt.data.date_created,
				group: charge.phoneNumbers[index].groupId, 
				charge: charge._id
			};

			if (err) 
				transactionObject.errorMsg = err.message;

			var trans = new Transaction(transactionObject);			

			trans.save(function (err, saved) {
				transactionIds.push(saved._id);
				console.log('(Charge ' + index + ') Charge to ' + charge.phoneNumbers[index].phoneNumber + ': COMPLETE');
				next(null, transactionIds); // CALL WITH PARAMS..... TODO	
			});

		});	
	};

	return f;

}

// creates second venmo_charge function to send in waterfall
function createOtherFunctionInArray(charge, venmoBody, index) {

	var f = function(transactionIds, next) {

		request.post(BASE_URL, {form: venmoBody}, function (err, resp, receipt) {
			console.log('received Venmo response ' + index);
			receipt = JSON.parse(receipt);

			var transactionObject = {
				phoneNumber: charge.phoneNumbers[index].phoneNumber,
				paymentId: receipt.data.payment.id,
				note: receipt.data.payment.note,
				status: receipt.data.payment.status, // should be pending
				dateCreated: receipt.data.date_created,
				group: charge.phoneNumbers[index].groupId, 
				charge: charge._id
			};

			if (err) 
				transactionObject.errorMsg = err.message;

			var trans = new Transaction(transactionObject);

			trans.save(function (err, saved) {
				transactionIds.push(saved._id);
				console.log('(Charge ' + index + ') Charge to ' + charge.phoneNumbers[index].phoneNumber + ': COMPLETE');
				next(null, transactionIds); // CALL WITH PARAMS..... TODO	
			});

		});	
	};

	return f;

}


// issues the request for each phone number
function createFunctionArray2(numbers) {
	var toRet = [];
	var arr = ['hello', 'world'];
	var firstF = function(next) {
		console.log('initial function');
		next(null, 'output_FIRST');
	};
	toRet.push(firstF);

	for (var i = 0; i < numbers; i++) {
		console.log('create function ' + i);
		var f = createSingleFunction(arr[i]);

		toRet.push(f);
	}

	return toRet;
}

function createSingleFunction (s) {
	var f = function (arg, next) {
		console.log('Value: ' + s);
		console.log('Parameter: ' + arg);
		next(null, 'output_'+s);
	};

	return f; 
}


// deletes all transactions associated with a charge, then removes
// the charge
router.delete('/:chargeId', function (req, res, next){
	Charge.findOne({_id: req.params.chargeId}, function (err, charge) {
		User.findOneAndUpdate({_id: req.session.user._id}, {$pull: {myCharges: charge._id}}, function (err, numAffected) {
			var transIds = charge.transactions;
			transIds.forEach(function (transaction) {
				Transaction.findByIdAndRemove({_id: transaction}, function (err, numAff) {
				});
			});
			charge.remove();
			res.send('charge deleted');
		})
	});
});



module.exports = router;