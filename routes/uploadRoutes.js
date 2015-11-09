var router = require('express').Router();
var fs = require('fs');
var xlsx = require('node-xlsx');
var multer = require('multer');
var Q = require('q');
var request = require('request');

var config = require('../config/index');
var BASE_URL = config.Venmo_BASE_URL;

var storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    cb(null, 'uploadedGroup.xlsx');
  }

});

var fileFilterObj = function (req, file, cb) {
  	// check if not an excel file
  	console.log('checking file type');
  	console.log(file.originalname);
  	console.log(file.originalname.indexOf('.xls'));
  	if (file.originalname.indexOf('.xls') > 0) {
  		cb(null, true);
  		return;
  	}
  	if (file.originalname.indexOf('.xlsx') > 0) {
  		cb(null, true);
  		return;
  	}
  	console.log('File type not supported');
  	cb(null, false);
 };

var upload = multer({ storage: storage, fileFilter: fileFilterObj });


// route handles uploading of the file, will send back preview
// of the charge to client
router.post('/', upload.any(), function (req, res, next) {
	
	console.log('received file...');
	console.log('saved file: ' + req.files[0].filename);
	console.log('parsing file...');
	var obj = xlsx.parse('./uploads/'+req.files[0].filename);
	console.log('new object');
	console.log(obj[0].data);

	// TODO: create json object to send back to front end
	// another route to take confirm charge

	// TODO: make sure excel is correct format

	var venmoArray = createVenmoObjects(obj[0].data, req);
	console.log(venmoArray);



	
	res.status(200).send(venmoArray);
});

// issues the charges to venmo
router.put('/', function (req, res, next) {
	console.log('issuing venmo charges...');
	issueAllVenmoCharges(req.body).then(function(results) {
		console.log(results);
		var allGood = true;
		results.forEach(function(result, index) {
			console.log('charge: ' + index);
			if(result.value) console.log(result.value.data.payment.target);
			else {
				console.log(result.reason);
				allGood = false;
			}
			
		});

		res.status(200).end();
	});
});


// returns promise that resolves when all charges have resolved
// resolve or reject, must check status upon return of this method
function issueAllVenmoCharges (venmoBodyArray) {
	return Q.allSettled(venmoBodyArray.map(function(venmoBody, index) {
		return issueVenmoChargeAsynch(venmoBody, index);
	}));
}

// asynch part of the function, will create a promise and return it
// on a per charge basis
function issueVenmoChargeAsynch(venmoBody, index) {
	var deferred = Q.defer();

	request.post(BASE_URL, {form: venmoBody}, function (err, resp, receipt) {
		console.log('received Venmo response ' + index);
		receipt = JSON.parse(receipt);
		if (err || receipt.error) deferred.reject(receipt);
		else deferred.resolve(receipt);			
	});

	return deferred.promise;
}

// creates array of vemmo objects to be sent to venmo
function createVenmoObjects(excel, req) {
	var toRet = [];
	for (var i = 1; i < excel.length; i++) {
		var amt = excel[i][2];
		amt = (amt < 0) ? amt : amt * -1; // can only do charges
		var obj = {
					access_token: req.session.user.access_token,
					phone: excel[i][0],
					note: excel[i][1],
					amount: amt,
					audience: 'public'
					};
		toRet.push(obj);
	}

	return toRet;
}

module.exports = router;