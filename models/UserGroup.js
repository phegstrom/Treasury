var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collectionName = 'usergroupsC';

var UserGroupSchema = new Schema({
	name: String,
	users: [String]
}, {collection: collectionName});

module.exports = mongoose.model('UserGroup', UserGroupSchema);