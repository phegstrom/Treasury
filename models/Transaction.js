var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    collectionName = "transactionsC";
	states = 'pending fulfilled cancelled'.split(' ');

var deepPopulate = require('mongoose-deep-populate');


var TransactionSchema = new Schema({
		phoneNumber: String,
		paymentId: String, // venmo id of the charge
		note: String,
		status: {type: String, enum: states, defult: states[0]},   // whether or not it has been fulfilled
		dateCompleted: {type: Date, default: null}, // date of charge completion
		dateCreated: {type: Date, default: Date.now},
		group: {type: Schema.Types.ObjectId, ref: 'UserGroup'},
		charge: {type: Schema.Types.ObjectId, ref: 'Charge'},
		errorMsg: String,
		userExists: {type: Boolean, default: true} // if phone number not a venmo user, then true
}, {collection: collectionName});


TransactionSchema.plugin(deepPopulate);


module.exports = mongoose.model('Transaction', TransactionSchema);