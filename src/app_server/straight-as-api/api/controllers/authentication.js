var passport = require('passport');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var User = mongoose.model('User');
var requestF = require('request');

// Create mail transporter.
let transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  port: 25,
  auth: {
    user: 'payup.app.2019@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});


// getJsonResponse: take response, status and JSON data and add status and data to response.
var getJsonResponse = function(response, status, data) {
  // Add status and JSON to response.
  response.status(status);
  response.json(data);
};



// ADMIN INITIALIZATION ///////////////////////////////////////////////////////////////

// initAdmins: initialize administrator account if it is not yet present.
module.exports.initAdmins = function (adminEmail) {
  emailExists(adminEmail).then(function(result) {   // Try to detect existing administrator account.
   if (result) {
      console.log("Administrator account detected.");
      return true;
   } else {                                               // If administrator account not detected, create from data in .env
    var newUser = new User();
    newUser._id = process.env.ADMIN_EMAIL;
    newUser.todoLists = [];
    newUser.calendars = [];
    newUser.timetables = [];
    newUser.status = 1;
    newUser.setPassword(process.env.ADMIN_PASS);
    newUser.admin = true;
	newUser.eventAdmin = true;
    User.create(newUser, function(error, user) {
        // If there was an error
        if (error) {
          console.log("Error adding administrator account.");
        } else {
          // Notify that administrator account was successfully added.
          console.log("Administrator account successfully added.");
          return true;
        }
      });
   }
  });
};

///////////////////////////////////////////////////////////////////////////////////////



// authLogIn: log in a user by verifying the username and password
// Return JWT if log in successfull
module.exports.authLogIn = function(request, response) {
	// If username or password missing
	if (!request.body.email || !request.body.password) {
		getJsonResponse(response, 400, {
			"message": "Missing data"
		});
	}
	
	// Authenticate user and return JWT if authentication successfull
	passport.authenticate('local', function(error, user, data) {
		if (error) {	// If encountered error
			getJsonResponse(response, 404, error);
			return;
		}
		if (user && user.status == 1) { 	// If authorization successfull, return generated JWT.
			getJsonResponse(response, 200, {
				"token" : user.generateJwt()
			});
		} else {		// If authorization unsuccessfull...
			getJsonResponse(response, 400, data);
		}
	})(request, response);
};

// Validate reCAPTCHA using Google's API
var validateCaptchaResponse = function(response) {
  return new Promise(function(resolve) {
    requestF.post(
      'https://www.google.com/recaptcha/api/siteverify',
      {
          form: {
              secret: process.env.RECAPTCHA_PASS,
              response: response
          }
      },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(Boolean(JSON.parse(response.body).success));
          } else {
            resolve(false);
          }
      }
    );
  });
};

// authSignUp: create new user and store in DB
module.exports.authSignUp = function(request, response) {
  // Check if passwords match.
  console.log(request.body.email);
  console.log(request.body.password1 == request.body.password2);
  if(request.body.password1 && request.body.password2 && request.body.password1 === request.body.password2) {
    // Create new user.
    var newUser = new User();
    newUser._id = request.body.email;
    newUser.setPassword(request.body.password1);
    newUser.status = 0;
    newUser.todoLists = [];
    newUser.calendars = [];
    newUser.timetables = [];
    newUser.admin = false;
    newUser.eventAdmin = false;
  // if passwords do not match
  } else {
    getJsonResponse(response, 400, {
      "message": "Passwords must match."
    });
    return;
  }
  // Validate created user.
  validateUser(newUser).then(function(result) {
    // If successfuly validated, create new user and send confirmation e-mail.
    if (result) {
      // Create new user.
      User.create(newUser, function(error, user) {
        // If there was an error
        if (error) {
        getJsonResponse(response, 500, error.message);
        // If all went well, send confirmation e-mail.
        } else {
          sendConfirmationMail(newUser._id, newUser._id, newUser.validationCode).then(function(result) {
            // If confirmation mail successfuly sent, return new user as signal value.
            if(result) {
              getJsonResponse(response, 201, user);
            } else {
              // if trouble sending confirmation e-mail
              getJsonResponse(response, 500, {'status' : 'Error sending confirmation mail.'});
            }
          });
        }
      });
    // If new user is not valid.
    } else {
      getJsonResponse(response, 400, {
          "message": "invalid user parameters"
      }); 
    }
  });
};


// validateUser: validate user properties
var validateUser = function(newUser) {
  // Validate user.
  return new Promise(function(resolve, reject) {
        // Create regular expression for email verification.
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	// Check parameter types and values.
      if (
        typeof newUser._id === 'string' &&
        re.test(String(newUser._id).toLowerCase())
       ) {
        // Check if username already exists.
        emailExists(newUser._id).then(function(result) {
          // If username is free, resolve with true.
          if (!result) {
            resolve(true);
          // else resolve with false.
          } else {
            resolve(false);
          }
        });
    // If types and values not valid, resolve with false.
    } else {
      resolve(false);
    }
  });
};

// usernameExists: check if user with given username exists in database
var emailExists = function(email) {
  return new Promise(function(resolve, reject) {
    // if request has parameters and the parameters include idUser
    if (email) {
    User
      .findById(email)
      .exec(function(error, user) {
        if (!user) {  // If user not found
          resolve(false);
        // if error while executing function
        } else if (error) {
          resolve(true);
        }
        // if success
        resolve(true);
      });
    // else if no parameters or if parameters do not include idUser
    } else {
      resolve(true);
    }
  });
};

// sendConfirmationMail: send confirmation mail to specified email
var sendConfirmationMail = function(emailAddress, idUser, validationCode) {
  return new Promise(function(resolve, reject) {
    sendMail(emailAddress, idUser, validationCode).then(function(result) {
      if (result) {  // If mail successfuly sent
        resolve(true);
      } else {  // Else.
        resolve(false);
      }
    });
  });
};

// sendMail: auxiliary function that sends mail.
var sendMail = function(emailAddress, idUser, validationCode) {
  return new Promise(function(resolve, reject) {
    // Define helper options.
    let HelperOptions = {
      from: 'payup.app.2019@gmail.com',
      to: emailAddress,
      subject: 'Confirm e-mail',
      text: 'Please click the link below to confirm your e-mail account.\n https://straight-asss.herokuapp.com/users/' + idUser + '/' + validationCode
      // text: 'Please click the link below to confirm your e-mail account.\n http://localhost:3000' + idUser + '/' + validationCode
    };
    // Send mail via transporter.
    transporter.sendMail(HelperOptions, (error, info) => {
        if (error) {      // If encoutered error, resolve as false.
		console.log(error.message);
          resolve(false);
        }
        resolve(true);  // If successfuly sent mail, resolve as true.
    });
  });
};

// authConfirm: confirm user's acount - this is called with a get request generated by following the link in the sent email
module.exports.authConfirm = function(request, response) {
  // If all request parameters are present
  if (request.params && request.params.idUser && request.params.validationCode) {
    // Find user by id and activate account.
    User.findById(request.params.idUser).exec(function(error, user) {
      if (user._id == request.params.idUser && request.params.validationCode == user.validationCode) {
        user.status = 1;
        user.save(function(error, user) {
          if (error) {
            getJsonResponse(response, 400, error);
          } else {
            response.writeHeader(200, {"Content-Type": "text/html"});  
            response.write('<div style="font-family: Times-New-Roman;"><h1>Account successfully verified!</h1><p>You can now log in with your account and start using our service!</p>Click <a href="https://straight-asss.herokuapp.com">here</a> to go back to the StraightAs website and log in!</div>');  
            response.end();
          }
        });
      } else {
        getJsonResponse(response, 400, "Missing request parameters");
      }
    });
  }
};

///////////////////////////////////////////////////////////////////////////////////

// PROMOTIOS //////////////////////////////////////////////////////////////////////


// promoteToAdmin: promote a user to an administrator.
// Can only be done by an administrator.
module.exports.promoteToAdmin = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (email == process.env.ADMIN_EMAIL) {
      if (request.params && request.params.idUser && request.body.admin 
        && (request.body.admin == 'true' || request.body.admin == 'false')) {
        User
          .findById(request.params.idUser)
          .exec(function(error, user) {
          if (!user) {  // If user not found
            getJsonResponse(response, 404, {
              "message": 
                "Cannot find user with given identifier idUser."
            });
            return;
          // if error while executing function
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          user.admin = request.body.admin;
          user.save(function(error) {
            if (error) {
              getJsonResponse(response, 500, error);
            } else {
              getJsonResponse(response, 200, user);
            }
          })
        });       
      } else {
        getJsonResponse(response, 404, {
          "message" : "bad request parameters"
        });
      }
    } else {
      getJsonResponse(response, 401, {
        "message" : "not authorized"
      });
    }
  });
}

// promoteToEventAdmin: promote a user to an event administrator.
// Can only be done by an administrator.
module.exports.promoteToEventAdmin = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (email == process.env.ADMIN_EMAIL) {
      if (request.params && request.params.idUser && request.body.eventAdmin 
        && (request.body.eventAdmin == 'true' || request.body.eventAdmin == 'false')) {
        User
          .findById(request.params.idUser)
          .exec(function(error, user) {
          if (!user) {  // If user not found
            getJsonResponse(response, 404, {
              "message": 
                "Cannot find user with given identifier idUser."
            });
            return;
          // if error while executing function
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          user.eventAdmin = request.body.eventAdmin;
          user.save(function(error) {
            if (error) {
              getJsonResponse(response, 500, error);
            } else {
              getJsonResponse(response, 200, user);
            }
          })
        });       
      } else {
        getJsonResponse(response, 404, {
          "message" : "bad request parameters"
        });
      }
    } else {
      getJsonResponse(response, 401, {
        "message" : "not authorized"
      });
    }
  });
}


///////////////////////////////////////////////////////////////////////////////////

// Get user's id (username) from JWT
var getLoggedId = function(request, response, callback) {
  // If request contains a payload and the payload contains a username
  if (request.payload && request.payload.id) {
    User
      .findById(
        request.payload.id
      )
      .exec(function(error, user) {
        if (!user) {     // If user not found
          getJsonResponse(response, 404, {
            "message": "User not found"
          });
          return;
        } else if (error) {   // if encountered error
          getJsonResponse(response, 500, error);
          return;
        }
        callback(request, response, user._id);
      });
  } else {    // Else if no payload or if payload does not contain field username
    getJsonResponse(response, 400, {
      "message": "Inadequate data in token"
    });
    return;
  }
};
