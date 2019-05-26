var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var User = mongoose.model('User');

// REST API database access methods

// getJsonResponse: take response, status and JSON data and add status and data to response.
var getJsonResponse = function(response, status, data) {
  // Add status and JSON to response.
  response.status(status);
  response.json(data);
};


// createEvent: create new event (can only be done by event administrator)
module.exports.createEvent = function(request, response) {
  getLoggedId(request, response, function(request, response, email) {
    if (request.params && request.params.idUser && request.params.idUser == email) {
      User
        .findById(request.params.idUser)
        .select('eventAdmin')
        .exec(function(error, user) {
          if (error) {
            getJsonResponse(response, 500, error);
          } else if (!user) {
			console.log("I FAIL HERE");
            getJsonResponse(response, 404, {
              'message': 'User not found'
            });
          } else {
            if (user.eventAdmin) {
              var newEvent = {
                date: request.body.date,
                title: request.body.title,
                description: request.body.description
              }
              Event.create(newEvent, function(error, createdEvent) {
                if (error) {
                  getJsonResponse(response, 500, error);
                } else {
                  getJsonResponse(response, 201, createdEvent)
                }
              })
            } else {
              getJsonResponse(response, 400, {
                'message': 'Not authorized'
              });
            }
          }
        })
    } else {
      getJsonResponse(response, 400, {
        'message': 'Bad request parameters'
      });
    }
  });
}


// getEvents: get all events posted by event administrators
module.exports.getEvents = function(request, response) {
  Event
    .find({}, function(error, results) {
      if (error) {
        getJsonResponse(response, 500, error);
      } else if (!results) {
        getJsonResponse(response, 404, {
          'message': 'No events found'
        });
      } else {
        getJsonResponse(response, 200, results);
      }
    });
}




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

