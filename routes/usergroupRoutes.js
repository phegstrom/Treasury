var passport = require('passport');
var request = require('request')
var router = require('express').Router();
var User = require('../models/User');
var UserGroup = require('../models/UserGroup');
var _ = require('underscore');

var config = require('../config/index');

// from config file
var Venmo_Client_ID = config.Venmo_Client_ID;
var Venmo_Client_SECRET = config.Venmo_Client_SECRET;
var Venmo_Callback_URL = config.Venmo_Callback_URL;



// returns all usergroups a user has 
router.get('/', function (req, res, next) {
	User.findOne({_id: req.session.user._id}, 'userGroups')
		.populate('userGroups')
		.exec(function (err, user) {		
			res.send(user.userGroups);
		});
});

// returns a specific usergroup
router.get('/:uGroupId', function (req, res, next) {

	UserGroup.findOne({_id: req.params.uGroupId}, function (err, uGroup) {
		res.send(uGroup);
	});

});

// will delete a person from a group
router.put('/deleteMembers/:uGroupId', function (req, res, next) {
	var indivPhoneNumbers = req.body.phoneNumbers;
	UserGroup.findOne({_id: req.params.uGroupId}, function (err, uGroup) {
		var copyMembers = [];
		for (var i = 0; i < uGroup.members.length; i++) {
			var iOf = _.indexOf(indivPhoneNumbers, uGroup.members[i].phoneNumber);
			if (iOf == -1) {
				copyMembers.push(uGroup.members[i]);
			}
		}
		uGroup.members = copyMembers;
		uGroup.save(function (err, saved) {
			res.send(saved);
		});
	});	
});

// will delete a person from a group
router.put('/addMembers/:uGroupId', function (req, res, next) {
	var newUsers = req.body.individuals;
	UserGroup.findOne({_id: req.params.uGroupId}, function (err, uGroup) {
		uGroup.members = _.union(uGroup.members, newUsers);
		uGroup.save(function (err, saved) {
			res.send(saved);
		});
	});	
});

// deletes a specific usergroup
router.delete('/:uGroupId', function (req, res, next) {

	// POSTman testing purposes
	var uid = req.session.user._id;
	// var uid = "54f77ab79ba3e5890a6f62cf";

	UserGroup.findOne({_id: req.params.uGroupId}, function (err, uGroup) {
		User.findOneAndUpdate({_id: uid}, {$pull: {userGroups: uGroup._id}}, function (err, numAffected) {
			uGroup.remove();
			res.send('user group deleted');
		})
	});

});

//POST - ryan
// create a user group
router.post('/', function (req, res, next) {
	var userArray = req.body.members;
	var groupName = req.body.name;
	console.log(req.body);

	var uid = req.session.user._id;

	var uGroup = new UserGroup({name: groupName, members: userArray});

	// save uGroup to DB and push its _id onto users ugroup array
	uGroup.save(function (err, saved) {
		if (err) next(err);
		User.findOneAndUpdate({_id: uid}, {$push: {userGroups: saved._id}}, function (err, numAFfected) {
			res.send(saved); //send JSON response for userGroup -- Ryan
		});
	});
});

module.exports = router;