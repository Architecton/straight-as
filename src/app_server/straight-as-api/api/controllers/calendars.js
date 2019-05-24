var mongoose = require('mongoose');
var User = mongoose.model('User');

// REST API database access methods

// getJsonResponse: take response, status and JSON data and add status and data to response.
var getJsonResponse = function(response, status, data) {
  // Add status and JSON to response.
  response.status(status);
  response.json(data);
};


// GET ALL CALENDARS FROM DATABASE //////////////////////////////////////

// calendarGetAll: get all calendars of all users (admin only)
module.exports.calendarGetAll = function(request, response) {
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
              var calendars = [];
              users.forEach(function(e) {
                calendars = calendars.concat(e.calendars);
              });
              
              // return array of all calendars.
              getJsonResponse(response, 200, calendars);
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



// MANAGING CALENDARS ///////////////////////////////////////////////////

// calendarCreate: add calendar to user with specified username 
module.exports.calendarCreate = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    var idUser = request.params.idUser;
    if (idUser && idUser == email) {
      User
        .findById(idUser)
        .select('calendars')
        .exec(
          function(error, user) {
            if (error) {
              getJsonResponse(response, 400, error);
            } else {
              addCalendarToUser(request, response, user);
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

// addCalendarToUser: auxiliary function for calendarCreate (see above)
var addCalendarToUser = function(request, response, user) {
  if (!user) {
    getJsonResponse(response, 404, {
      "message": "Cannot find user."
    });
  } else {
    // Create new calendar.
    var newCalendar = {
      events: []
    };
    // Add calendar to user's list of calendars.
    user.calendars.push(newCalendar);
    user.save(function(error, user) {
      if (error) {
        getJsonResponse(response, 500, error);
      } else {
        getJsonResponse(response, 201, user.calendars.slice(-1)[0]);
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

// ** calendarGetUsersCalendars: get all calendars of user with given id
module.exports.calendarGetUsersCalendars = function(request, response) {
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
          getJsonResponse(response, 200, user.calendars);
        });
    } else {
      getJsonResponse(response, 400, { 
        "message": "identifier idUser is missing."
      });
    }
  });
};


// calendarGetSelected: return calendar with given id of user with given idUser (email)
module.exports.calendarGetSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (request.params && request.params.idUser && request.params.idCalendar && request.params.idUser == email) {
      User
        .findById(request.params.idUser)
        .select('calendars')
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
            if (user.calendars && user.calendars.length > 0) {
              calendar = user.calendars.id(request.params.idCalendar);
              if (!calendar) {
                getJsonResponse(response, 404, {
                  "message": 
                    "Cannot find calendar."
                });
              } else {
                getJsonResponse(response, 200, calendar);
              }
            } else {
              getJsonResponse(response, 404, {
                "message": "Cannot find any calendars."
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



// calendarDeleteSelected: delete calendar with specified id of user with specified id
module.exports.calendarDeleteSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idCalendar || request.params.idUser != email) {
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
          if (user.calendars && user.calendars.length > 0) {
            if (!user.calendars.id(request.params.idCalendar)) {
              getJsonResponse(response, 404, {
                "message": "Cannot find calendar."
              });
            } else {
              user.calendars.id(request.params.idCalendar).remove();
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
              "message": "No calendars to delete."
            });
          }
        }
      );
  });
};



// calendarGetEvent: get calendar event with specified id from calendar with specified id of user with specified id.
module.exports.calendarGetEvent = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idCalendar || !request.params.idCalendarEvent || request.params.idUser != email) {
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
          if (user.calendars && user.calendars.length > 0) {
            if (!user.calendars.id(request.params.idCalendar).events) {
              getJsonResponse(response, 404, {
                "message" : "no events on calendar"
              });
              return;
            }
            var calendarEvent = user.calendars.id(request.params.idCalendar).events.id(request.params.idCalendarEvent);
            if (calendarEvent) {
              getJsonResponse(response, 200, calendarEvent);
            } else {
              getJsonResponse(response, 404, {
                "message" : "Cannot find specified calendar event."
              });
            }
          } else {
            getJsonResponse(response, 404, {
              "message" : "Cannot find any calendars"
            });
          }
    });
  });
}

// calendarAddEvent: add event to calendar with specified id of user with specified id
module.exports.calendarAddEvent = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idCalendar || request.params.idUser != email) {
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
            if (user.calendars) {
              if (request.body.title && request.body.description 
					  && request.body.year 
                      && request.body.month
                      && request.body.day
                      && !isNaN(request.body.year) 
                      && !isNaN(request.body.month) 
					  && !isNaN(request.body.day)) {
                var newCalendarEvent = {
                  "title" : request.body.title,
                  "description" : request.body.description,
                  "year" : request.body.year,
                  "month": request.body.month,
                  "day": request.body.day
                }
                if (user.calendars.id(request.params.idCalendar)) {
                  user.calendars.id(request.params.idCalendar).events.push(newCalendarEvent);
                } else {
                  getJsonResponse(response, 404, {
                    'message' : 'Calendar not found.'
                  });
                  return;
                }
                user.save(function(error, user) {
                  if (error) {
                    getJsonResponse(response, 500, error);
                  } else {
                    getJsonResponse(response, 201, user.calendars.id(request.params.idCalendar).events.slice(-1)[0]);
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



// calendarDeleteEvent: delete calendar event with specified id from calendar with specified id of user with specified id
module.exports.calendarDeleteEvent = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (!request.params.idUser || !request.params.idCalendar || 
      !request.params.idCalendarEvent || request.params.idUser != email) {
      getJsonResponse(response, 400, {
        "message" : "bad request parameters"
      });
    } else {
      User
        .findById(request.params.idUser)
        .select('calendars')
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
            if (user.calendars && user.calendars.length > 0) {
              var currentCalendar = user.calendars.id(request.params.idCalendar);
              if (currentCalendar) {
                if (!currentCalendar.events) {
                  getJsonResponse(response, 404, {
                    "message" : "no events found"
                  });
                  return;
                }
                if (currentCalendar.events.id(request.params.idCalendarEvent)) {
                  currentCalendar.events.id(request.params.idCalendarEvent).remove();
                  user.save(function(error) {
                    if (error) {
                      getJsonResponse(response, 500, error); 
                    } else {
                      getJsonResponse(response, 204, null);
                    }
                  })
                } else {
                  getJsonResponse(response, 404, {
                    "message" : "Calendar event with specified id not found."
                  });
                }
              } else {
                getJsonResponse(response, 404, {
                  "message" : "Calendar with specified id not found."
                });
              }
            } else {
              getJsonResponse(response, 400, {
                "message" : "Bad request parameters."
              });
            }
          });
    }
  });
}


// calendarUpdateSelected: update calendar event with specified id of calendar with specified calendar ID of user with specified id
module.exports.calendarUpdateSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    // If request parameters do not include idUser or idCalendarEvent or if idUser does not match email in JWT
    if (!request.params.idUser || !request.params.idCalendar 
			|| !request.params.idCalendarEvent || request.params.idUser != email) {
      getJsonResponse(response, 400, {
        "message":"Bad request parameters"
      });
      return;
    }
    User
      .findById(request.params.idUser)
      .select('calendars')
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
          if (user.calendars && user.calendars.length > 0) {
            var currentCalendar = 
              user.calendars.id(request.params.idCalendar);
            if (!currentCalendar) {
              getJsonResponse(response, 404, {
                "message": "Cannot find calendars."
              });
            } else {
              if (!currentCalendar.events) {
                getJsonResponse(response, 404, {
                  "message" : "No events found on calendar."
                });
                return;
              }
              var currentCalendarEvent = user.calendars.id(request.params.idCalendar).events.id(request.params.idCalendarEvent); 
              if (!currentCalendar) {
                getJsonResponse(response, 404, {
                  "message": "Cannot find event on calendar."
                });
              } else {
                if (!isNaN(request.body.year) 
                  && !isNaN(request.body.month)
                  && !isNaN(request.body.day)
                  && request.body.title
                  && request.body.description) {
                  currentCalendarEvent.title = request.body.title;
                  currentCalendarEvent.description = request.body.description;
                  currentCalendarEvent.year = request.body.year;
                  currentCalendarEvent.month = request.body.month;
                  currentCalendarEvent.day = request.body.day;
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
                    getJsonResponse(response, 200, user.calendars.id(request.params.idCalendar).events.id(request.params.idCalendarEvent));
                  }
                });
              }
            }
          } else {
            getJsonResponse(response, 404, {
              "message": "No calendars to update."
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
