var passport = require('passport');
var request = require('request')
var router = require('express').Router();
var User = require('../models/User');
var UserGroup = require('../models/UserGroup');


var Venmo_Client_ID = '2360';
var Venmo_Client_SECRET = 'eakFc2jPuHjvZWe3ULGKsdB7Tg4kvEH3';
var Venmo_Callback_URL = 'http://localhost:3000/auth/venmo/callback';



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


// create a user group
router.post('/', function (req, res, next) {
	var userArray = req.body.members;
	var groupName = req.body.name;
	console.log(req.body);
	// POSTman testing purposes

	var uid = req.session.user._id;
	// var uid = "54f77ab79ba3e5890a6f62cf";

	var uGroup = new UserGroup({name: groupName, members: userArray});

	// save uGroup to DB and push its _id onto users ugroup array
	uGroup.save(function (err, saved) {
		User.findOneAndUpdate({_id: uid}, {$push: {userGroups: saved._id}}, function (err, numAFfected) {
			res.send(saved);
		});
	});
});

module.exports = router;