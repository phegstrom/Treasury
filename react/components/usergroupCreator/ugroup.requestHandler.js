// Module that handles requests to the server for the user group
// creator component

module.exports = {

	createUserGroup: function(usergroupObj, cb) {
		$.ajax({
            type: 'POST',
            url: '/usergroup', //API request
            data: JSON.stringify(usergroupObj),  //NEED THESE       
            contentType: 'application/json; charset=UTF-8', //NEED THESE
            success: function(uGroup) {  //line 95 from usergroupRoutes.js            
            	cb(null, uGroup);
            }.bind(this),
            error: function() {
            	cb('err');
            }
        });
	}

}