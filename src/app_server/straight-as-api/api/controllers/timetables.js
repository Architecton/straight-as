var mongoose = require('mongoose');
var User = mongoose.model('User');

// REST API database access methods

// getJsonResponse: take response, status and JSON data and add status and data to response.
var getJsonResponse = function(response, status, data) {
  // Add status and JSON to response.
  response.status(status);
  response.json(data);
};


// GET ALL TIMETABLES FROM DATABASE //////////////////////////////////////

// timetableGetAll: get all timetables of all users (admin only)
module.exports.timetableGetAll = function(request, response) {
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
              var timetables = [];
              users.forEach(function(e) {
                timetables = timetables.concat(e.timetables);
              });
              
              // return array of all timetables.
              getJsonResponse(response, 200, timetables);
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



// MANAGING TIMETABLES ///////////////////////////////////////////////////

// timetableCreate: add timetable to user with specified username 
module.exports.timetableCreate = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    var idUser = request.params.idUser;
    if (idUser && idUser == email) {
      User
        .findById(idUser)
        .select('timetables')
        .exec(
          function(error, user) {
            if (error) {
              getJsonResponse(response, 400, error);
            } else {
              addTimetableToUser(request, response, user);
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

// addTimetableToUser: auxiliary function for timetableCreate (see above)
var addTimetableToUser = function(request, response, user) {
  if (!user) {
    getJsonResponse(response, 404, {
      "message": "Cannot find user."
    });
  } else {
    // Create new timetable.
    var newTimetable = {
      events: []
    };
    // Add timetable to user's list of timetables.
    user.timetables.push(newTimetable);
    user.save(function(error, user) {
      if (error) {
        getJsonResponse(response, 500, error);
      } else {
        getJsonResponse(response, 201, user.timetables.slice(-1)[0]);
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

// ** timetableGetUsersTimetables: get all timetables of user with given id
module.exports.timetabeGetUsersTimetables = function(request, response) {
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
          getJsonResponse(response, 200, user.timetables);
        });
    } else {
      getJsonResponse(response, 400, { 
        "message": "identifier idUser is missing."
      });
    }
  });
};


// timetableGetSelected: return timetable with given id of user with given idUser (email)
module.exports.timetableGetSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (request.params && request.params.idUser && request.params.idTimetable && request.params.idUser == email) {
      User
        .findById(request.params.idUser)
        .select('timetables')
        .exec(
          function(error, user) {
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
            if (user.timetables && user.timetables.length > 0) {
              timetable = user.timetables.id(request.params.idTimetable);
              if (!timetable) {
                getJsonResponse(response, 404, {
                  "message": 
                    "Cannot find timetable."
                });
              } else {
                getJsonResponse(response, 200, timetable);
              }
            } else {
              getJsonResponse(response, 404, {
                "message": "Cannot find any timetables."
              });
            }
          }
        );
    } else {
      getJsonResponse(response, 400, {
        "message": 
          "Bad request parameters."
      });
    }
  });
};



// timetableDeleteSelected: delete timetable with specified id of user with specified id
module.exports.timetableDeleteSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idTimetable || request.params.idUser != email) {
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
          if (user.timetables && user.timetables.length > 0) {
            if (!user.timetables.id(request.params.idTimetable)) {
              getJsonResponse(response, 404, {
                "message": "Cannot find timetable."
              });
            } else {
              user.timetables.id(request.params.idTimetable).remove();
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
              "message": "No timetables to delete."
            });
          }
        }
      );
  });
};



// timetableGetEvent: get timetable event with specified id from timetable with specified id of user with specified id.
module.exports.timetableGetEvent = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idTimetable || !request.params.idTimetableEvent || request.params.idUser != email) {
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
          if (user.timetables && user.timetables.length > 0) {
            if (!user.timetables.id(request.params.idTimetable).events) {
              getJsonResponse(response, 404, {
                "message" : "no events on timetable"
              });
              return;
            }
            var timetableEvent = user.timetables.id(request.params.idTimetable).events.id(request.params.idTimetableEvent);
            if (timetableEvent) {
              getJsonResponse(response, 200, timetableEvent);
            } else {
              getJsonResponse(response, 404, {
                "message" : "Cannot find specified timetable event."
              });
            }
          } else {
            getJsonResponse(response, 404, {
              "message" : "Cannot find any timetables"
            });
          }
    });
  });
}

// timetableAddEvent: add event to timetable with specified id of user with specified id
module.exports.timetableAddEvent = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idTimetable || request.params.idUser != email) {
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
            if (user.timetables) {
              if (request.body.description && request.body.startDate 
					  && request.body.endDate && !isNaN(request.body.startDate) 
					  && !isNaN(request.body.endDate)) {
                var newTimetableEvent = {
                  "description" : request.body.description,
                  "startDate" : request.body.startDate,
                  "endDate" : request.body.endDate
                }
                if (user.timetables.id(request.params.idTimetable)) {
                  user.timetables.id(request.params.idTimetable).events.push(newTimetableEvent);
                } else {
                  getJsonResponse(response, 404, {
                    'message' : 'Timetable not found.'
                  });
                  return;
                }
                user.save(function(error, user) {
                  if (error) {
                    getJsonResponse(response, 500, error);
                  } else {
                    getJsonResponse(response, 201, user.timetables.id(request.params.idTimetable).events.slice(-1)[0]);
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



// timetableDeleteEvent: delete timetable event with specified id from timetable with specified id of user with specified id
module.exports.timetableDeleteEvent = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idTimetable || 
      !request.params.idTimetableEvent || request.params.idUser != email) {
      getJsonResponse(response, 400, {
        "message" : "bad request parameters"
      });
    } else {
      User
        .findById(request.params.idUser)
        .select('timetables')
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
            if (user.timetables && user.timetables.length > 0) {
              var currentTimetable = user.timetables.id(request.params.idTimetable);
              if (currentTimetable) {
                if (!currentTimetable.events) {
                  getJsonResponse(response, 404, {
                    "message" : "no events found"
                  });
                  return;
                }
                if (currentTimetable.events.id(request.params.idTimetableEvent)) {
                  currentTimetable.events.id(request.params.idTimetableEvent).remove();
                  user.save(function(error) {
                    if (error) {
                      getJsonResponse(response, 500, error); 
                    } else {
                      getJsonResponse(response, 204, null);
                    }
                  })
                } else {
                  getJsonResponse(response, 404, {
                    "message" : "timetable event with specified id not found"
                  });
                }
              } else {
                getJsonResponse(response, 404, {
                  "message" : "timetable with specified id not found"
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


// timetableUpdateSelected: update timetable event with specified id of timetable with specified timetable ID of user with specified id
module.exports.timetableUpdateSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    // If request parameters do not include idUser or idTimetableEvent or if idUser does not match email in JWT
    if (!request.params.idUser || !request.params.idTimetable 
			|| !request.params.idTimetableEvent || request.params.idUser != email) {
      getJsonResponse(response, 400, {
        "message":"Bad request parameters"
      });
      return;
    }
    User
      .findById(request.params.idUser)
      .select('timetables')
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
          if (user.timetables && user.timetables.length > 0) {
            var currentTimetable = 
              user.timetables.id(request.params.idTimetable);
            if (!currentTimetable) {
              getJsonResponse(response, 404, {
                "message": "Cannot find timetable."
              });
            } else {
              if (!currentTimetable.events) {
                getJsonResponse(response, 404, {
                  "message" : "no events found on timetable"
                });
                return;
              }
              var currentTimetableEvent = user.timetables.id(request.params.idTimetable).events.id(request.params.idTimetableEvent); 
              if (!currentTimetableEvent) {
                getJsonResponse(response, 404, {
                  "message": "Cannot find event on timetable."
                });
              } else {
                if (!isNaN(request.body.startDate && !isNaN(request.body.endDate))) {
                  currentTimetableEvent.description = request.body.description;
                  currentTimetableEvent.startDate = request.body.startDate;
                  currentTimetableEvent.endDate = request.body.endDate;
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
                    getJsonResponse(response, 200, user.timetables.id(request.params.idTimetable).events.id(request.params.idTimetableEvent));
                  }
                });
              }
            }
          } else {
            getJsonResponse(response, 404, {
              "message": "No timetables to update."
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
