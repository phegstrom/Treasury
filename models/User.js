var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');
    collectionName = "usersC";


// note other fields are created by the .plugin() method below
var UserSchema = new Schema({
	name: String,
	userGroups: [{type: Schema.Types.ObjectId, ref: 'UserGroup'}],
    access_token: {type: String, default: null},
    refresh_token: {type: String, default: null},	
	dateCreated: {type: Date, default: Date.now}
}, {collection: collectionName});

var options = {usernameField: 'email'};
UserSchema.plugin(passportLocalMongoose, options);

module.exports = mongoose.model('User', UserSchema);