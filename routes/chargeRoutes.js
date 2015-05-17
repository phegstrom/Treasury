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


router.get('/transactions', function (req, res, next) {
	Transaction.find().exec(function (err, trans) {
		var d = new Date('2015-04-08T03:16:03');
		console.log(d);
		res.send(trans);
	});	
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
							myGroups: groups,
							audience: req.body.audience
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
// using async.js waterfall() to handle multiple asynch operations
router.post('/', function (req, res, next){
	console.log('issuing charges to venmo api...');

	var fnArray = createWaterfallArray(req, res);

	async.waterfall(fnArray);

});

// will add users to a charge after the charge has been initiated
router.put('/:chargeId', function (req, res, next){
	var newUsers = req.body.targets;

	Charge.findOne({_id: req.params.chargeId}, function (err, charge) {
		charge.addedUsers = _.union(charge.addedUsers, newUsers);
		charge.total += (newUsers.length * charge.individualTotal);
		charge.save(function (err, saved) {
			console.log('adding individual transaction to charge...')

			// stage vars for the venmo api
			req.charge = saved.toJSON();
			req.charge.phoneNumbers = getPhoneNumberObject(newUsers, null);

			var fnArray = createWaterfallArray(req, res);

			async.waterfall(fnArray);

		});
	});
});

function createWaterfallArray(req, res) {
	var charge = req.charge;
	var numbers = charge.phoneNumbers;
	var transIds = [];
	var funcArray = [];

	// first function in waterfall function array
	var f = function (next) {
		var transactionIds = [];
		next(null, transactionIds);
	};

	funcArray.push(f);

	// create individual functions for each request to venmo server
	for (var i = 0; i < numbers.length; i++) {

		var body = {
			access_token: req.session.user.access_token,
			phone: numbers[i].phoneNumber, // COMES FROM PHONE ARRAY
			note: charge.description, // req.charge.description
			amount: charge.individualTotal, // req.charge.individualTotal
			audience: charge.audience// req.charge.audience
		};			

		var f = createFunctionInArray(charge, body, i);
		
		funcArray.push(f);

	}

	// final function in waterfall
	var lastFunction = function (transactionIds) {
		Charge.findOneAndUpdate({_id: req.charge._id}, {$pushAll: {transactions: transactionIds}}, function (err, charge){
			console.log('finalized charges!!');
			res.send(charge);
		}); 
	};

	funcArray.push(lastFunction);

	return funcArray;

};

// creates venmo_charge function to send in waterfall
function createFunctionInArray(charge, venmoBody, index) {

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
				charge: charge._id,
				userExists: true
			};


			if (err) 
				transactionObject.errorMsg = err.message;

			// handle case where phone number is not assoc. with a venmo
			// account
			if (receipt.data.payment.target.user == null) {
				transactionObject.userExists = false;
			}

			var trans = new Transaction(transactionObject);

			trans.save(function (err, saved) {
				transactionIds.push(saved._id);
				console.log('(Charge ' + index + ') Charge to ' + charge.phoneNumbers[index].phoneNumber + ': COMPLETE');
				next(null, transactionIds);	
			});

		});	
	};

	return f;

}

// deletes all transactions associated with a charge, then removes
// the charge
// used just for testing purposes
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

// creates the array of objects: toRet = [{phoneNumber: value, groupId: value}]
function getPhoneNumberObject(members, groupId) {
	var toRet = [];
	var phonNumbers = _.pluck(members, 'phoneNumber');
	phonNumbers.forEach(function (number) {
		toRet.push(_.object(['phoneNumber', 'groupId'], [number, groupId]));
	});

	return toRet;
}

// function that returns the first function variable for my waterfall
// sequence when handling multiple async venmo requests
function getInitialWaterfallFunction() {
	var f = function (next) {
		var transactionIds = [];
		next(null, transactionIds);
	};
	return f;
}

module.exports = router;