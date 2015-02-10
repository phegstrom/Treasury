var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    collectionName = "chargesC";


// note other fields are created by the .plugin() method below
var ChargeSchema = new Schema({
	description: String,
	totalReceived: Number,
	total: Number,
	individualTotal: {type: Number, required: true},
	transactionIds: [String],
	transactionStatuses: [Boolean],
	group: [{type: Schema.Types.ObjectId, ref: 'UserGroup'}],	
	dateCreated: {type: Date, default: Date.now}
}, {collection: collectionName});


module.exports = mongoose.model('Charge', ChargeSchema);