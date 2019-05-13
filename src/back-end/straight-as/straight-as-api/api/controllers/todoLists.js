var mongoose = require('mongoose');
var User = mongoose.model('User');

// REST API database access methods

// getJsonResponse: take response, status and JSON data and add status and data to response.
var getJsonResponse = function(response, status, data) {
  // Add status and JSON to response.
  response.status(status);
  response.json(data);
};


// GET ALL TODO LISTS FROM DATABSE //////////////////////////////////////

// TODO only admin
// todoListGetAll: get all todo lists of all users (Admin only)
module.exports.todoListGetAll = function(request, response) {
  User
    .find({})
    .exec(function(error, users) {
      if (!users) {  // If user not found
        getJsonResponse(response, 404, {
          "message": 
            "Cannot find any users in the database."
        });
        return;
      // if error while executing function
      } else if (error) {
        getJsonResponse(response, 500, error);
        return;
      }
      
      // Get contacts of all users and concatenate in array and return as response.
      var todoLists = [];
      users.forEach(function(e) {
        todoLists = todoLists.concat(e.todoLists);
      });
      
      // return array of all todo lists.
      getJsonResponse(response, 200, todoLists);
    });
};

//////////////////////////////////////////////////////////////////////////



// MANAGING TODO LISTS /////////////////////////////////////////////////////

// todoListCreate: add todo list to user with specified username 
module.exports.todoListCreate = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    // get user's id
    var idUser = request.params.idUser;
    // if idUser is not null and is equal to the username in JWT
    if (idUser && idUser == email) {
      // find user by its id (username)
      User
        .findById(idUser)
        .select('todoLists')
        .exec(
          function(error, user) {
            if (error) {
              getJsonResponse(response, 400, error);
            } else {
              addTodoListToUser(request, response, user);
            }
          }
        );
    } else {
      getJsonResponse(response, 400, {
        "message": 
          "Bad request parameters"
      });
    }
  });
};

// *** AUXILIARY FUNCTIONS *** //

// addTodoListToUser: auxiliary function for todoListCreate (see above)
var addTodoListToUser = function(request, response, user) {
  // If user undefined.
  if (!user) {
    getJsonResponse(response, 404, {
      "message": "Cannot find user."
    });
  } else {
    // Create new contact.
    var newTodoList = {
      items: []
    };
    // Add todo list to user's list of todo lists.
    user.todoLists.push(newTodoList);
    user.save(function(error, user) {
      // if encountered error
      if (error) {
        getJsonResponse(response, 500, error);
      } else {
        getJsonResponse(response, 201, newTodoList);
      }
    });
  }
};

// emailExists: check if user with given email exists in database
var emailExists = function(username) {
  return new Promise(function(resolve, reject) {
    // if request has parameters and the parameters include idUser
    if (username) {
    User
      .findById(username)
      .exec(function(error, user) {
        if (!user) {   // If user not found
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


// *************************** //

// ** todoListsGetUsersTodoLists: get all todo lists of user with given id
module.exports.todoListGetUsersTodoLists = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    // if request has parameters, the parameters include idUser and idUser is same as username in JWT
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
          getJsonResponse(response, 200, user.todoLists);
        });
    // else if no parameters or if parameters do not include idUser
    } else {
      getJsonResponse(response, 400, { 
        "message": "identifier idUser is missing."
      });
    }
  });
};


// todoListGetSelected: return todo list with given id of user with given idUser (email)
module.exports.todoListGetSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    // if request has parameters and they include idUser and idContact and idUser is the same as the username in the JWT
    if (request.params && request.params.idUser && request.params.idTodoList && request.params.idUser == email) {
      User
        .findById(request.params.idUser)
        .select('todoLists')
        .exec(
          function(error, user) {
            var todoList;
            // if user not found
            if (!user) {
              getJsonResponse(response, 404, {
                "message": 
                  "Cannot find user."
              });
              return;
              // if encountered error
            } else if (error) {
              getJsonResponse(response, 500, error);
              return;
            }
            // if user has property contacts and user has at least one contact
            if (user.todoLists && user.todoLists.length > 0) {
              // Get contact.
              todoList = user.todoLists.id(request.params.idTodoList);
              // if contact not found
              if (!todoList) {
                getJsonResponse(response, 404, {
                  "message": 
                    "Cannot find todo list."
                });
              } else {
                // Return signal object.
                getJsonResponse(response, 200, todoList);
              }
            // if no contacts found
            } else {
              getJsonResponse(response, 404, {
                "message": "Cannot find any todo list."
              });
            }
          }
        );
    } else {
      getJsonResponse(response, 400, {
        "message": 
          "Invalid request parameters."
      });
    }
  });
};


// todoListUpdateSelected: update todo list with specified todo list ID of user with specified id
module.exports.todoListUpdateSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    // If request parameters do not include idUser or idTodoItem or if idUser does not match email in JWT
    if (!request.params.idUser || !request.params.idTodoList || request.params.idUser != email) {
      getJsonResponse(response, 400, {
        "message":"Bad request parameters"
      });
      return;
    }
    User
      .findById(request.params.idUser)
      .select('todoLists')
      .exec(
        function(error, user) {
          // if user not found
          if (!user) {
            getJsonResponse(response, 404, {
              "message": "Cannot find user."
            });
            return;
          // If encountered error
          } else if (error) {
              getJsonResponse(response, 500, error);
            return;
          }
          // If user has property contacts and user has at least one contact
          if (user.todoLists && user.todoLists.length > 0) {
            var currentTodoList = 
              user.todoLists.id(request.params.idTodoList);
            if (!currentTodoList) {
              getJsonResponse(response, 404, {
                "message": "Cannot find todo list."
              });
            } else {
              var currentTodoListItem = user.todoLists.id(request.params.idTodoList).id(request.params.idTodoListItem);
              
              if (!currentTodoListItem) {
                getJsonResponse(response, 404, {
                  "message": "Cannot find item on todo list."
                });
              } else {
                // VALIDATE REQUESTED UPDATES
                if (  // Validate contact properties types and values.
                  typeof request.body.description === 'string' &&
                  typeof request.body.date === 'number'
                  ) {
                  // Update contact
                  currentTodoListItem.description = request.body.description;
                  currentTodoListItem.date = request.body.date;
                } else {
                  // If contact parameters are invalid.
                  getJsonResponse(response, 400, {
                    "message": "Invalid parameters."
                  });
                  return;
                }
                // Save user with modified todo list.
                user.save(function(error, user) {
                  // if encountered error
                  if (error) {
                    getJsonResponse(response, 400, error);
                  } else {
                    // Return updated contact as response.
                    getJsonResponse(response, 200, currentTodoList);
                  }
                });
              }
            }
          } else {
            getJsonResponse(response, 404, {
              "message": "No todo lists to update."
            });
          }
        }
      );
  });
};

// todoListDeleteSelected: delete todo list with specified id of user with specified id
module.exports.todoListDeleteSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    // If request parameters do not include user id or contact id or if idUser does not match username in JWT
    if (!request.params.idUser || !request.params.idTodoList || request.params.idUser != email) {
      getJsonResponse(response, 400, {
        "message":"Bad request parameters"
      });
      return;
    }
    User
      .findById(request.params.idUser)
      .exec(
        function(error, user) {
          // if user not found
          if (!user) {
            getJsonResponse(response, 404, {
              "message": "Cannot find user."
            });
            return;
            // if encountered error
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          // if user has property contacts and user has at least one contact
          if (user.todoLists && user.todoLists.length > 0) {
            // if contact with given idContact not found
            if (!user.todoLists.id(request.params.idTodoList)) {
              getJsonResponse(response, 404, {
                "message": "Cannot find todo list."
              });
            } else {
              // Remove contact with given idContact.
              user.todoLists.id(request.params.idTodoList).remove();
              // Save user state.
              user.save(function(error) {
                // if encountered error
                if (error) {
                  getJsonResponse(response, 500, error);
                } else {
                  // GONE
                  getJsonResponse(response, 204, null);
                }
              });
            }
          // if contact not found
          } else {
            getJsonResponse(response, 404, {
              "message": "No todo lists to delete."
            });
          }
        }
      );
  });
};

//////////////////////////////////////////////////////////////////////////

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