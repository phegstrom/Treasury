// Module that handles requests to the server for the charge
// creator component

module.exports = {

	issueCharge: function(chargeObj, cb) {
		$.ajax({
            type: 'POST',
            url: '/charge', //API request endpoint
            data: JSON.stringify(chargeObj),  //NEED THESE       
            contentType: 'application/json; charset=UTF-8', //NEED THESE
            success: function(charge) {
            	cb(null, charge);
            }.bind(this),
            error: function() {
            	cb('err');
            }
        });
	}

}