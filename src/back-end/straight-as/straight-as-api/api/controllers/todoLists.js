var mongoose = require('mongoose');
var User = mongoose.model('User');

// REST API database access methods

// getJsonResponse: take response, status and JSON data and add status and data to response.
var getJsonResponse = function(response, status, data) {
  // Add status and JSON to response.
  response.status(status);
  response.json(data);
};


// GET ALL todo LISTS FROM DATABSE //////////////////////////////////////

// todoListGetAll: get all todo lists of all users (Admin only)
module.exports.todoListGetAll = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {

    User
      .findById(email)
      .exec(function(error, user) {
        if (!user) {
          getJsonResponse(response, 404, {
            "message" : "user not found"
          });
          return;
        } else if (error) {
          getJsonResponse(response, 500, error);
          return;
        }
        if (user.admin) {
          User
            .find({})
            .exec(function(error, users) {
              if (!users) {
                getJsonResponse(response, 404, {
                  "message": 
                    "Cannot find any users in the database."
                });
                return;
              } else if (error) {
                getJsonResponse(response, 500, error);
                return;
              }
              var todoLists = [];
              users.forEach(function(e) {
                todoLists = todoLists.concat(e.todoLists);
              });
              
              // return array of all todo lists.
              getJsonResponse(response, 200, todoLists);
            });
        } else {
          getJsonResponse(response, 401, {
            "message" : "not authorized"
          });
        }
      });
    });
};

//////////////////////////////////////////////////////////////////////////



// MANAGING todo LISTS /////////////////////////////////////////////////////

// todoListCreate: add todo list to user with specified username 
module.exports.todoListCreate = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    var idUser = request.params.idUser;
    if (idUser && idUser == email) {
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
  if (!user) {
    getJsonResponse(response, 404, {
      "message": "Cannot find user."
    });
  } else {
    // Create new todo list.
    var newTodoList = {
      items: []
    };
    // Add todo list to user's list of todo lists.
    user.todoLists.push(newTodoList);
    user.save(function(error, user) {
      if (error) {
        getJsonResponse(response, 500, error);
      } else {
        getJsonResponse(response, 201, user.todoLists.slice(-1)[0]);
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
    if (request.params && request.params.idUser && request.params.idTodoList && request.params.idUser == email) {
      User
        .findById(request.params.idUser)
        .select('todoLists')
        .exec(
          function(error, user) {
            var todoList;
            if (!user) {
              getJsonResponse(response, 404, {
                "message": 
                  "Cannot find user."
              });
              return;
            } else if (error) {
              getJsonResponse(response, 500, error);
              return;
            }
            if (user.todoLists && user.todoLists.length > 0) {
              todoList = user.todoLists.id(request.params.idTodoList);
              if (!todoList) {
                getJsonResponse(response, 404, {
                  "message": 
                    "Cannot find todo list."
                });
              } else {
                getJsonResponse(response, 200, todoList);
              }
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



// todoListDeleteSelected: delete todo list with specified id of user with specified id
module.exports.todoListDeleteSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
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
          if (!user) {
            getJsonResponse(response, 404, {
              "message": "Cannot find user."
            });
            return;
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          if (user.todoLists && user.todoLists.length > 0) {
            if (!user.todoLists.id(request.params.idTodoList)) {
              getJsonResponse(response, 404, {
                "message": "Cannot find todo list."
              });
            } else {
              user.todoLists.id(request.params.idTodoList).remove();
              user.save(function(error) {
                if (error) {
                  getJsonResponse(response, 500, error);
                } else {
                  getJsonResponse(response, 204, null);
                }
              });
            }
          } else {
            getJsonResponse(response, 404, {
              "message": "No todo lists to delete."
            });
          }
        }
      );
  });
};

// todoListGetItem: get todo list item with specified item from todo list with specified id of user with specified id.
module.exports.todoListGetItem = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idTodoList || !request.params.idTodoListItem || request.params.idUser != email) {
      getJsonResponse(response, 400, {
          "message":"Bad request parameters"
      });
      return;
    }
    User
      .findById(request.params.idUser)
      .exec(
        function(error, user) {
          if   (!user) {
            getJsonResponse(response, 404, {
              "message": "Cannot find user."
            });
            return;
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          if (user.todoLists && user.todoLists.length > 0) {
            if (!user.todoLists.id(request.params.idTodoList).items) {
              getJsonResponse(response, 404, {
                "message" : "no items on todo list"
              });
              return;
            }
            var todoListItem = user.todoLists.id(request.params.idTodoList).items.id(request.params.idTodoListItem);
            if (todoListItem) {
              getJsonResponse(response, 200, todoListItem)
            } else {
              getJsonResponse(response, 404, {
                "message" : "Cannot find specified todo list item."
              });
            }
          } else {
            getJsonResponse(response, 404, {
              "message" : "Cannot find any todo lists"
            });
          }
    });
  });
}

// todoListAddItem: add item to todo list with specified id of user with specified id
module.exports.todoListAddItem = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idTodoList || request.params.idUser != email) {
      getJsonResponse(response, 400, {
        "message" : "Bad request parameters"
      });
    } else {
      User.findById(request.params.idUser)
          .exec(function(error, user) {
            if (!user) {
              getJsonResponse(response, 404, {
                "message" : "Cannot find specified user"
              })
              return;
            } else if (error) {
              getJsonResponse(response, 500, error);
              return;
            } 
            if (user.todoLists) {
              if (request.body.description && request.body.dueDate && !isNaN(request.body.dueDate)) {
                var newTodoListItem = {
                  "description" : request.body.description,
                  "dueDate" : request.body.date,
                  "completed" : false
                }
                user.todoLists.id(request.params.idTodoList).items.push(newTodoListItem)
                user.save(function(error, user) {
                  if (error) {
                    getJsonResponse(response, 500, error);
                  } else {
                    getJsonResponse(response, 201, user.todoLists.id(request.params.idTodoList).items.slice(-1)[0]);
                  }
                })
              } else {
                getJsonResponse(response, 400, {
                  "message" : "bad request parameters"
                });
              }
            }
          });  
    }  
  });
}


// todoListItemSetCompletion: set completed status of todo list item with specified id 
// of todo list with specified id of user with specified id
module.exports.todoListItemSetCompletion = function(request, response) {
  console.log("Here");
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idTodoList ||
      !request.params.idTodoListItem || request.params.idUser != email || 
      !request.body.completed || 
      !(request.body.completed == 'true' || request.body.completed == 'false')) {
      getJsonResponse(response, 400, {
        "message" : "bad request parameters"
      });
    } else {
      User
        .findById(request.params.idUser)
        .select('todoLists')
        .exec(
          function(error, user) {
            if (!user) {
              getJsonResponse(response, 404, {
                "message" : "user not found"
              });
              return;
            } else if (error) {
              getJsonResponse(response, 500, error); 
              return;
            }
            if (user.todoLists && user.todoLists.length > 0) {
              var selectedTodoList = user.todoLists.id(request.params.idTodoList);
              if (selectedTodoList) {
                if (selectedTodoList.items) {
                  var selectedTodoListItem = selectedTodoList.items.id(request.params.idTodoListItem);
                } else {
                  getJsonResponse(response, 404, {
                    "message" : "no items on specified todo list"
                  });
                  return;
                }
                if (selectedTodoListItem) {
                  selectedTodoListItem.completed = request.body.completed;
                  user.save(function(error) {
                    if (error) {
                      getJsonResponse(response, 500, error);
                    } else {
                      getJsonResponse(response, 200, selectedTodoListItem);
                    }
                  });
                } else {
                  getJsonResponse(response, 404, {
                    "message" : "specified todo list item not found"
                  });
                }
              } else {
                getJsonResponse(response, 404, {
                  "message" : "specified todo list not found"
                });
              }
            } else {
              getJsonResponse(response, 404, {
                "message" : "no todo lists not found"
              });
            }
          }
        );
    }
  });
}

// todoListDeleteItem: delete todo list item with specified id from todo list with specified id of user with specified id
module.exports.todoListDeleteItem = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idTodoList || 
      !request.params.idTodoListItem || request.params.idUser != email) {
      getJsonResponse(response, 400, {
        "message" : "bad request parameters"
      });
    } else {
      User
        .findById(request.params.idUser)
        .select('todoLists')
        .exec(
          function(error, user) {
            if (!user) {
              getJsonResponse(response, 404, {
                "message" : "Cannot find user."
              });
              return;
            } else if (error) {
              getJsonResponse(response, 500, error);
              return;
            }
            if (user.todoLists && user.todoLists.length > 0) {
              var currentTodoList = user.todoLists.id(request.params.idTodoList);
              if (currentTodoList) {
                if (!currentTodoList.items) {
                  getJsonResponse(response, 404, {
                    "message" : "no items found"
                  });
                  return;
                }
                if (currentTodoList.items.id(request.params.idTodoListItem)) {
                  currentTodoList.items.id(request.params.idTodoListItem).remove();
                  user.save(function(error) {
                    if (error) {
                      getJsonResponse(response, 500, error); 
                    } else {
                      getJsonResponse(response, 204, null);
                    }
                  })
                } else {
                  getJsonResponse(response, 404, {
                    "message" : "todo list item with specified id not found"
                  });
                }
              } else {
                getJsonResponse(response, 404, {
                  "message" : "todo list with specified id not found"
                });
              }
            } else {
              getJsonResponse(response, 400, {
                "message" : "bad request parameters"
              });
            }
          });
    }
  });
}


// todoListUpdateSelected: update todo list with specified todo list ID of user with specified id
module.exports.todoListUpdateSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    // If request parameters do not include idUser or idTodoItem or if idUser does not match email in JWT
    if (!request.params.idUser || !request.params.idTodoList || !request.params.idTodoListItem || request.params.idUser != email) {
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
          if (!user) {
            getJsonResponse(response, 404, {
              "message": "Cannot find user."
            });
            return;
          } else if (error) {
              getJsonResponse(response, 500, error);
            return;
          }
          if (user.todoLists && user.todoLists.length > 0) {
            var currentTodoList = 
              user.todoLists.id(request.params.idTodoList);
            if (!currentTodoList) {
              getJsonResponse(response, 404, {
                "message": "Cannot find todo list."
              });
            } else {
              if (!currentTodoList.items) {
                getJsonResponse(response, 404, {
                  "message" : "no items found on todo list"
                });
                return;
              }
              var currentTodoListItem = user.todoLists.id(request.params.idTodoList).items.id(request.params.idTodoListItem); 
              if (!currentTodoListItem) {
                getJsonResponse(response, 404, {
                  "message": "Cannot find item on todo list."
                });
              } else {
                if (
                  !isNaN(request.body.dueDate)
                  ) {
                  currentTodoListItem.description = request.body.description;
                  currentTodoListItem.date = request.body.date;
                } else {
                  getJsonResponse(response, 400, {
                    "message": "Invalid parameters."
                  });
                  return;
                }
                user.save(function(error, user) {
                  if (error) {
                    getJsonResponse(response, 400, error);
                  } else {
                    getJsonResponse(response, 200, user.todoLists.id(request.params.idTodoList).items.id(request.params.idTodoListItem));
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

//////////////////////////////////////////////////////////////////////////

// Get user's id (username) from JWT
var getLoggedId = function(request, response, callback) {
  // If request contains a payload and the payload contains the field "id"
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
  } else {    // Else if no payload or if payload does not contain field "id"
    getJsonResponse(response, 400, {
      "message": "Inadequate data in token"
    });
    return;
  }
};
