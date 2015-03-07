var router = require('express').Router();
var User = require('../models/User');
var Charge = require('../models/Charge');
var UserGroup = require('../models/UserGroup');
var request = require('request');

var BASE_URL = 'https://sandbox-api.venmo.com/v1/payments';
// var BASE_URL = 'https://api.venmo.com/v1/payments';

// return array of charges for a given user
router.get('/', function (req, res, next) {
	User.findOne({_id: req.session.user._id}, 'myCharges')
		.populate('myCharges')
		.exec(function (err, user) {		
			res.send(user.myCharges);
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
							myGroups: groups
						});
	
	UserGroup.getMemberCount(groups, function (err, memberCount, phoneArray) {
		charge.total = memberCount*indTotal;
		charge.save(function (err, saved) {

			User.findOneAndUpdate({_id: uid}, {$push: {myCharges: saved._id}}, function (err, numAffected) {
				req.charge = saved.toJSON();
				req.charge.phoneNumbers = phoneArray;
				next(); 
				// res.redirect(307, 'issueCharge');
			});

		});
	});
});

// part of the route that issues the requests
router.post('/', function (req, res, next){

	// var fnArray = createFunctionArray(req.charge.phoneNumbers);

	res.send(req.charge);
});

// route for testing venmo chargin
router.get('/test', function (req, res, next) {

	var body = {
		access_token: req.session.user.access_token,
		phone: '2488821795',
		note: 'sent from our app! but ignore',
		amount: '-.20',
		audience: 'private'
	};

	request.post(BASE_URL, {form: body}, function (err, resp, receipt) {
		res.send(receipt);
	});	

});

// issues the request for each phone number
function createFunctionArray(numbers) {

}


router.delete('/:chargeId', function (req, res, next){
	Charge.findOne({_id: req.params.chargeId}, function (err, charge) {
		User.findOneAndUpdate({_id: req.session.user._id}, {$pull: {myCharges: charge._id}}, function (err, numAffected) {
			charge.remove();
			res.send('charge deleted');
		})
	});
});



module.exports = router;