const request = require("request");
const expect = require("chai").expect;
const baseUrl = "http://localhost:3000";

const admin_account = {
	'_id' : 'je.vivod@gmail.com',
	'admin' : true
};

const login_email = "je.vivod@gmail.com";
const login_password = "geselce";


// ########################### 1. AUTHENTICATION AND ADMINISTRATION TESTS ########################### 

// (1.1.1) Test if administrator's account exists.
// (1.1.2) Test if "admin" flag is set to true.
// (1.2.1) Test if user that logs in receives JWT.


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

  });
});

describe('log in', () => {
		describe('ogging in with existing account', () => {

				// (1.2.1)
				it('Upon logging in, user should receive JWT token.', (done) => {
						request({
								url : baseUrl + '/users/login',
								method : 'post',
								form : {
									email : login_email,
									password : login_password
								}
						}, function(error, response, body) {
							const bodyObj = JSON.parse(body);
							expect(response.statusCode).to.equal(200);
							expect(bodyObj).to.haveOwnProperty('token');
							done();
						});
				});
		});
});

// ##################################################################################################






// ########################### 2. todo lists ########################################################

describe('Working with todo lists', () => {
		describe('Working with todo lists', () => {
				it('There should be no todo lists initialy.', (done) => {

				});

				it('After adding a todo list there should be a single todo list.', (done) => {

				});
		});
		describe('Getting information about specific todo list', () => {
				it('We should be able to get the todo list information by its id.', (done) => {

				});

				it('The todo list should contain no items.', (done) => {

				});
		});
		describe('Deleting a todo list', () => {
				it('The todo list should no longer be in the database after being deleted.', (done) => {

				});
		});
});

describe('Working with todo list items', () => {
		describe('Adding, reading, updating and deleting items from a todo list', () => {
				it('There should be no todo lists initialy.', (done) => {

				});

				it('There should be a single todo list after adding one.', (done) => {

				});

				it('There should be no items on the created todo list initialy.', (done) => {

				});

				it('There should be a single item on the todo list after adding it.', (done) => {

				});

				it('The initial value of the "completed" property of the item on the todo list should be "false".', (done) => {

				});

				it('The value of the "completed" property of the item on the todo list should be "true" after setting it.', (done) => {

				});

				it('The description of the todo item should change.', (done) => {

				});

				it('The todo item should no longer be in the database after deleting it.', (done) => {

				});
		});
});

// ##################################################################################################




// ########################### 3. users #############################################################

describe('Information about users', () => {
	describe('Users should be able to see information about their account and should be able to delete their accounts.', () => {
		it('Administrator should be able to access all accounts.', (done) => {

		});

		it('User should be able to see information about their account.', (done) => {

		});

		it('User should be able to delete their account.', (done) => {

		});
	});

	describe('Administrator should be able to promote an existing user to an event administrator', () => {
			it('User should not be an event administrator initially', (done) => {

			});
			it('User should be an event administrator after being promoted by administrator', (done) => {

			})
	});

	describe('Administrator should be able to promote an existing user to an administrator', () => {
			it('User should not be an administrator initially', (done) => {

			});

			it('User should be an administrator after being promoted by an administrator', (done) => {

			});
	})	
});


// ##################################################################################################
