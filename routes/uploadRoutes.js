var router = require('express').Router();


var config = require('../config/index');

var BASE_URL = config.Venmo_BASE_URL;
	

router.post('/', function (req, res, next) {
	console.log('received file...');
	// no longer supported below
	//console.log(req.files);
	res.send(200);
});



module.exports = router;
