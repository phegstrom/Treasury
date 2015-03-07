var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    collectionName = "transactionsC";
	states = 'pending fulfilled'.split(' ');

var TransactionSchema = new Schema({
		phoneNumber: String,
		paymenId: String, // venmo id of the charge
		status: {type: String, enum: states, defult: states[0]},   // whether or not it has been fulfilled
		dateCompleted: {type: Date, default: null}, // date of charge completion
		dateCreated: {type: Date, default: Date.now},
		group: {type: Schema.Types.ObjectId, ref: 'UserGroup'},
		charge: {type: Schema.Types.ObjectId, ref: 'Charge'}
}, {collection: collectionName});


module.exports = mongoose.model('Transaction', TransactionSchema);