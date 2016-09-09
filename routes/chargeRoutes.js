var router = require('express').Router();
var User = require('../models/User');
var Charge = require('../models/Charge');
var UserGroup = require('../models/UserGroup');
var Transaction = require('../models/Transaction');
var mongoose	= require('mongoose');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var Q = require('q');

// var io = require('socket.io').listen(require('../bin/www'));
var io;
var server = require('../bin/www');
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

router.get('/test', function (req, res, next) {
	console.log('this is io');
	console.log(server);
	res.redirect('/');
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

	if (indTotal > 0) indTotal *= -1; // make sure charge total is neg.

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
router.post('/', function (req, res, next){
	console.log('issuing charges to venmo api...');
	var venmoRequestBodies = createRequestBodies(req.charge);
	issueAllVenmoCharges(venmoRequestBodies, req.session.user.access_token).then(function(results) {
			console.log('Received all venmo responses!');
			console.log('Processing venmo responses...')
			var transactionBodies = createTransactionBodies(results, req.charge);
			saveAllTransactions(transactionBodies).then(function(results) {
				var transactionIds = _.map(results, function(result) {
					return result.value._id;
				});
				Charge.findOneAndUpdate({_id: req.charge._id}, {$pushAll: {transactions: transactionIds}}, function (err, charge){
							console.log('finalized all charges!!');
							// TODO: Parker
							// do a deep populate on the charge object then send
							// with io socket
							io.emit('chargeCreated', charge); // for live update on client
							res.send(charge);
				});
				// res.send(results);				
			});
			// res.send(results);
	});
});

// returns promise that resolves when all charges have resolved
// resolve or reject, must check status upon return of this method
function issueAllVenmoCharges (venmoBodyArray, access_token) {
	console.log('Charge count: ' + venmoBodyArray.length);
	return Q.allSettled(venmoBodyArray.map(function(venmoBody, index) {
		return issueVenmoChargeAsynch(venmoBody, index, access_token);
	}));
}

// asynch part of the function, will create a promise and return it
// on a per charge basis
function issueVenmoChargeAsynch(venmoBody, index, access_token) {
	var deferred = Q.defer();
	venmoBody.access_token = access_token;
	request.post(BASE_URL, {form: venmoBody}, function (err, resp, receipt) {
		console.log('received Venmo response ' + index);
		receipt = JSON.parse(receipt);
		if (err || receipt.error) deferred.reject(receipt);
		else deferred.resolve(receipt);			
	});

	return deferred.promise;
}

// creates individual request bodies to be sent to
// venmo server
function createRequestBodies(charge) {
	var toRet = [];
	for (var i = 0; i < charge.phoneNumbers.length; i++) {
		var amt = charge.individualTotal;
		amt = (amt < 0) ? amt : amt * -1; // can only do charges
		amt = amt.toFixed(2); // only two decimals
		console.log('amount: ' + amt);
		var obj = {
					phone: charge.phoneNumbers[i].phoneNumber,
					note: charge.description,
					amount: amt,
					audience: charge.audience
					};
		toRet.push(obj);
	}

	return toRet;
}

function saveAllTransactions(transactionBodies) {
	console.log('Transaction count: ' + transactionBodies.length);
	return Q.allSettled(transactionBodies.map(function(transactionBody, index) {
		return saveAllTransactionsAsynch(transactionBody, index);
	}));
}


function saveAllTransactionsAsynch(transactionBody, index) {
	var deferred = Q.defer();
	var trans = new Transaction(transactionBody);

	trans.save(function (err, saved) {
		if (err) deferred.reject(err);
		else deferred.resolve(saved);				
	});

	return deferred.promise;
}

function createTransactionBodies(results, charge) {
	var toRet = [];
	results.forEach(function(result) {
		var transaction = {};
		if (result.reason) { // error from venmo!
			transaction.errorMsg = 'Error, charge did not issue: ' + result.reason.error.message;
			transaction.username = 'Unknown';
		} else { // it worked, now check if user in venmo system
			if (result.value.data.payment.target.user == null) {
				transaction.errorMsg = 'Charge issued succesfully, but user not found in system. Check phone number';
				transaction.userExists = false;
			} else {
				transaction.username = result.value.data.payment.target.user.display_name;	
			}
			// add other props to transaction object
			transaction.phoneNumber = result.value.data.payment.target.phone;
			transaction.paymentId = result.value.data.payment.id;
			transaction.note = result.value.data.payment.note;
			transaction.status = result.value.data.payment.status;
			transaction.charge = charge._id;
			// TODO: Get UsergroupID
			// transaction.group = charge.phoneNumbers[] 
		}		
		toRet.push(transaction);
	});

	return toRet;
}

// will add users to a charge after the charge has been initiated
// router.put('/:chargeId', function (req, res, next){
// 	var newUsers = req.body.targets;

// 	Charge.findOne({_id: req.params.chargeId}, function (err, charge) {
// 		charge.addedUsers = _.union(charge.addedUsers, newUsers);
// 		charge.total += (newUsers.length * charge.individualTotal);
// 		charge.save(function (err, saved) {
// 			console.log('adding individual transaction to charge...')

// 			// stage vars for the venmo api
// 			req.charge = saved.toJSON();
// 			req.charge.phoneNumbers = getPhoneNumberObject(newUsers, null);

// 			var fnArray = createWaterfallArray(req, res);

// 			// execute the functions
// 			async.waterfall(fnArray);

// 		});
// 	});
// });

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

module.exports = router;
module.exports.giveSocket = function(ioSocket) {
	io = ioSocket;
}