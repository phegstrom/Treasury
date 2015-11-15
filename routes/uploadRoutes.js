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

var upload = multer({storage: storage});

// route handles uploading of the file, will send back preview
// of the charge to client
router.post('/', upload.any(), function (req, res, next) {
	
	console.log('received file...');
	console.log('saved file: ' + req.files[0].filename);
	console.log('parsing file...');
	var obj = xlsx.parse('./uploads/'+req.files[0].filename);
	console.log('new object');
	console.log(obj[0].data);

	// check if excel document correct format
	var venmoArray;
	if(obj[0].data[0].length != 3) venmoArray = {err: 'file not in correct format!'};
	else venmoArray = createVenmoObjects(obj[0].data, req);
	
	console.log(venmoArray);
	
	res.status(200).send(venmoArray);
});

// issues the charges to venmo
router.put('/', function (req, res, next) {
	console.log('issuing venmo charges...');
	issueAllVenmoCharges(req.body).then(function(results) {
		console.log('got results');
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
	console.log('Charge count: ' + venmoBodyArray.length);
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