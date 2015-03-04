var router = require('express').Router();
var User = require('../models/User');
var Charge = require('../models/Charge');
var UserGroup = require('../models/UserGroup');


router.get('/', function (req, res, next) {
	User.findOne({_id: req.session.user._id}, 'myCharges')
		.populate('myCharges')
		.exec(function (err, user) {		
			res.send(user);
		});
});

router.post('/', function (req, res, next){
	var desc = req.body.description;
	var indTotal = req.body.individualTotal;
	var groups = req.body.groupIDs;

	// POSTman testing purposes
	// var uid = req.session.user._id;
	var uid = "54f77ab79ba3e5890a6f62cf";

	var charge = new Charge({description: desc, individualTotal: indTotal, myGroups: groups});
	
	UserGroup.getMemberCount(groups, function(memberCount) {
		charge.total = memberCount*indTotal;
		charge.save(function (err, saved) {

			User.findOneAndUpdate({_id: uid}, {$push: {myCharges: saved._id}}, function (err, numAffected) {
				res.send(saved);
			});

		});
	});

});




module.exports = router;