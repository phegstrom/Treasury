var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    collectionName = "chargesC";
	states = 'pending fulfilled'.split(' ');

// note other fields are created by the .plugin() method below
var ChargeSchema = new Schema({
	description: String,
	totalReceived: Number, // amount received
	total: Number, // individualTotol * size of group
	individualTotal: Number, // charge to each person
	transactions: [{type: Schema.Types.ObjectId, ref: 'Transaction'}],
	myGroups: [{type: Schema.Types.ObjectId, ref: 'UserGroup'}], // groups assoc. with charge	
	dateCreated: {type: Date, default: Date.now}
}, {collection: collectionName});


module.exports = mongoose.model('Charge', ChargeSchema);