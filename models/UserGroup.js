var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collectionName = 'usergroupsC';

var UserGroupSchema = new Schema({
	name: String,
	members: [{
		displayName: String,
		phoneNumber: String
	}]
}, {collection: collectionName});


// input: array of group ids
// output: total members in all
UserGroupSchema.statics.getMemberCount = function (groups, cb) {

	this.find({_id: {$in: groups}}, function (err, grps){
		if (err) next(err);

		var totalMembersToCharge = 0;
		for(var i = 0; i < grps.length; i++){
			totalMembersToCharge += grps[i].members.length;
		}
		cb(totalMembersToCharge);
	});

};

module.exports = mongoose.model('UserGroup', UserGroupSchema);