var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    collectionName = "chargesC";


// note other fields are created by the .plugin() method below
var ChargeSchema = new Schema({
	description: String,
	totalReceived: Number, // amount received
	total: Number, // individualTotol * size of group
	individualTotal: {type: Number, required: true}, // charge to each person
	transactionIds: [String], // id for transaction
	transactionStatuses: [Boolean], // true = person paid
	group: [{type: Schema.Types.ObjectId, ref: 'UserGroup'}], // groups assoc. with charge	
	dateCreated: {type: Date, default: Date.now}
}, {collection: collectionName});


module.exports = mongoose.model('Charge', ChargeSchema);