var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collectionName = 'usergroupsC';
var _ = require('underscore');

var UserGroupSchema = new Schema({
	name: String,
	members: [{
		displayName: String,
		phoneNumber: String
	}]
}, {collection: collectionName});


// input: array of group ids
// output: total members in all, array of all phone numbers
UserGroupSchema.statics.getMemberCount = function (groups, cb) {
	var phoneNumberArray = [];
	this.find({_id: {$in: groups}}, function (err, grps){
		if (err) next(err);

		var totalMembersToCharge = 0;
		for(var i = 0; i < grps.length; i++){
			totalMembersToCharge += grps[i].members.length;
			phoneNumberArray = _.union(phoneNumberArray,
										getPhoneNumbers(grps[i].members));
		}

		cb(err, totalMembersToCharge, phoneNumberArray);
	});

};

function getPhoneNumbers (members) {
	return _.pluck(members, 'phoneNumber');
}


module.exports = mongoose.model('UserGroup', UserGroupSchema);