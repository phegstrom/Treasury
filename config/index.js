var conf = require('./' + (process.env.NODE_ENV || 'development') + '.js');

// add venmo specific config info
conf.Venmo_Client_ID = '2360';
conf.Venmo_Client_SECRET = 'eakFc2jPuHjvZWe3ULGKsdB7Tg4kvEH3';
conf.Venmo_Callback_URL = 'http://localhost:3000/auth/venmo/callback';
conf.Venmo_Auth_URL = 'http://api.venmo.com/v1/oauth/authorize?';
conf.Venmo_Auth_ACCESSTOKEN_URL = 'https://api.venmo.com/v1/oauth/access_token';
conf.Venmo_scopeString = 'make_payments access_profile access_email access_phone access_balance';

/* ------------------- Choose Sandbox or Actual API ------------------*/
conf.Venmo_BASE_URL = 'https://sandbox-api.venmo.com/v1/payments';
//conf.Venmo_BASE_URL = 'https://api.venmo.com/v1/payments';

module.exports = conf;