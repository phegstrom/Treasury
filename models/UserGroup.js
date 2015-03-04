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

module.exports = mongoose.model('UserGroup', UserGroupSchema);