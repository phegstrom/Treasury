var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    collectionName = "chargesC";


// note other fields are created by the .plugin() method below
var ChargeSchema = new Schema({
	description: String,
	totalReceived: Number, // amount received
	total: Number, // individualTotol * size of group
	individualTotal: {type: Number, required: true}, // charge to each person
	transactionIds: [{
		chargeId: String, // venmo id of the charge
		status: Boolean   // whether or not it has been fulfilled
	}],
	myGroups: [{type: Schema.Types.ObjectId, ref: 'UserGroup'}], // groups assoc. with charge	
	dateCreated: {type: Date, default: Date.now}
}, {collection: collectionName});


module.exports = mongoose.model('Charge', ChargeSchema);