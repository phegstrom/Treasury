var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');
    collectionName = "usersC";


// note: other fields (email) are created by the .plugin() method below
var UserSchema = new Schema({
	name: String,
	venmo_username: {type: String, default: null},
	venmo_id: {type: String, default: null},
    venmoEmail: String,
    myBalance: Number,
	userGroups: [{type: Schema.Types.ObjectId, ref: 'UserGroup'}],
    access_token: {type: String, default: null},
    refresh_token: {type: String, default: null},
    tokenExpireDate: Date,
    myCharges: [{type: Schema.Types.ObjectId, ref: 'Charge'}],
	dateCreated: {type: Date, default: Date.now}
}, {collection: collectionName});

var options = {usernameField: 'email'};

UserSchema.plugin(passportLocalMongoose, options);

module.exports = mongoose.model('User', UserSchema);