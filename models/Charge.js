var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collectionName = "chargesC";
var audienceType = 'public private'.split(' ');
var deepPopulate = require('mongoose-deep-populate');


// note other fields are created by the .plugin() method below
var ChargeSchema = new Schema({
	description: String,
	totalReceived: Number, // amount received
	total: Number, // individualTotol * size of group
	individualTotal: Number, // charge to each person
	transactions: [{type: Schema.Types.ObjectId, ref: 'Transaction'}],
	myGroups: [{type: Schema.Types.ObjectId, ref: 'UserGroup'}], // groups assoc. with charge
	addedUsers: [{									
					displayName: String, // these are users that are added as a result of a p.number error						
					phoneNumber: Number
				}],	
	dateCreated: {type: Date, default: Date.now},
	audience: {type: String, enum: audienceType, default: audienceType[0]}
}, {collection: collectionName});


ChargeSchema.plugin(deepPopulate);


module.exports = mongoose.model('Charge', ChargeSchema);