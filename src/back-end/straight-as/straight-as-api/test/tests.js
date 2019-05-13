const request = require("request");
const expect = require("chai").expect;
const baseUrl = "http://localhost:3000";
const admin_account = {
	'_id' : 'je.vivod@gmail.com',
	'admin' : true
};


// ########################### 1. AUTHENTICATION AND ADMINISTRATION TESTS ########################### 

// (1.1.1) Test if administrator's account exists.
// (1.1.2) Test if "admin" flag is set to true.


describe('administrator account', () => {
  describe('administrator account exists', () => {

	// (1.1.1)
    it('administrator account should have specified email', (done) => {
        request.get({ url: baseUrl + '/users' },
            function(error, response, body) {
            	const bodyObj = JSON.parse(body);
				for (var i = 0; i < bodyObj.length; i++) {
					if (bodyObj[0]._id === 'je.vivod@gmail.com') {
						done();
						return
					}
				}
				done(new Error('Administrator account with "_id" equal to' + admin_account._id + ' not found.'));
            });
    });


	// (1.1.2)
    it('administrator account should have "admin" property set to "true"', (done) => {
        request.get({ url: baseUrl + '/users' },
            function(error, response, body) {
            	const bodyObj = JSON.parse(body);
				for (var i = 0; i < bodyObj.length; i++) {
					if (bodyObj[0]._id === admin_account._id && bodyObj[0].admin === admin_account.admin) {
						done();
						return
					}
				}
				done(new Error('"admin" flag is not set for account with "_id" equal to ' + admin_account._id));
            });
    });

  })
})

// ##################################################################################################
