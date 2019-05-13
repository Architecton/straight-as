var mongoose = require('mongoose');
var User = mongoose.model('User');
// REST API database access methods

/*
IMPLEMENTED

router.get('/users', ctrlUsers.userGetAll);
router.post('/users', ctrlUsers.userCreate);
router.get('/users/:idUser', ctrlUsers.userGetSelected);
router.delete('/users/:idUser', ctrlUsers.userDeleteSelected);
*/


// getJsonResponse: take response, status and JSON data and add status and data to response.
var getJsonResponse = function(response, status, data) {
  // Add status and JSON to response.
  response.status(status);
  response.json(data);
};


// DB //////////////////////////////////////////////////////////////////

// nukeDB: remove all contents of database collection Users
module.exports.nukeDB = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    if (username == process.env.ADMIN_EMAIL) {
      User.remove({}, function(err, user){
        if (err) {
          // if encountered error
          getJsonResponse(response, 500, err);   
        }
        else {
          getJsonResponse(response, 204, null);
        }
      }); 
    } else {
      getJsonResponse(response, 401, {"message" : "not authorized"});
    }
  });
};

// nukeDBindexes: remove all stored indexes from database
module.exports.nukeDBindexes = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    if (username == process.env.ADMIN_EMAIL) {
      User.collection.dropIndexes(function (err, results) {
        if (err) {
          // if encountered error
          getJsonResponse(response, 500, err);
        } else {
          getJsonResponse(response, 204, null);
        }
      });
    } else {
      getJsonResponse(response, 401, {"message" : "not authorized"});
    }
  });
};

///////////////////////////////////////////////////////////////////////


// MANAGING USERS ////////////////////////////////////////////////////

// TODO: only admin

// userGetAll: get all users in database
module.exports.userGetAll = function(request, response) {
  // Return all users
  User
    .find({}, '_id admin')
    .exec(function(error, users) {
      if (!users) {  // If user not found
        getJsonResponse(response, 404, {
          "message": 
            "Cannot find users."
        });
        return;
      // if error while executing function
      } else if (error) {
        getJsonResponse(response, 500, error);
        return;
      }
      // if success
      getJsonResponse(response, 200, users);
    });
};


// userGetSelected: return user with given idUser (username)
module.exports.userGetSelected = function(request, response) {
    getLoggedId(request, response, function(request, response, email) {
      // if request has parameters and the parameters include idUser
      if (request.params && request.params.idUser && request.params.idUser == email) {
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
          // if success
          getJsonResponse(response, 200, user);
        });
    // else if no parameters or if parameters do not include idUser
    } else {
      getJsonResponse(response, 400, { 
        "message": "Bad request parameters"
      });
    }
  });
};


// userDeleteSelected: delete user with specified idUser (username)
module.exports.userDeleteSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    var idUser = request.params.idUser;
    // if idUser is not null and idUser is the same as the username in the JWT
    if (idUser && idUser == email) {
      User
        .findByIdAndRemove(idUser)  // Find user by idUser and remove.
        .exec(
          function(error, user) {
            // if encountered error
            if (error) {
              getJsonResponse(response, 404, error);
              return;
            }
            // if success, return status 204 and null signal object.
            getJsonResponse(response, 204, null);
          }
        );
        // if idUser not present.
    } else {
      getJsonResponse(response, 400, {
        "message": 
          "Bad request parameters"
      });
    }
  });
};

/////////////////////////////////////////////////////////////////////

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
