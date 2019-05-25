var request = require('request');
const baseUrl = 'https://tpo-api-lpp.herokuapp.com';

// getJsonResponse: take response, status and JSON data and add status and data to response.
var getJsonResponse = function(response, status, data) {
  // Add status and JSON to response.
  response.status(status);
  response.json(data);
};

// getClosestStationArrivals: get list of arrivals on station closest to user.
module.exports.getClosestStationArrivals = function(req, res) {
  request({
    url: baseUrl + '/station/closest',
    qs: {
      lat: req.body.lat,
      lon: req.body.lng
    },
    method: 'get'
  }, function(error, response, body) {
    if (error) {
      getJsonResponse(res, 500, error);
    } else {
      const bodyObj = JSON.parse(body);
      getJsonResponse(res, 200, bodyObj);
    }
  })
}

// getStationArrivals: get station arrivals for station with specified name.
module.exports.getStationArrivals = function(req, res) {
  if (req.params && req.params.stationName) {
    request({
      url: baseUrl + '/station/arrivals/' + req.params.stationName,
      method: 'get'
    }, function(error, response, body) {
      if (error) {
        getJsonResponse(res, 500, error);
      } else {
        const bodyObj = JSON.parse(body);
        getJsonResponse(res, 200, bodyObj);
      }
    });
  } else {
    getJsonResponse(res, 400, {
      'message': 'Bad request parameters.'
    });
  }
}


// getClosestRestaurantsData: get data for closest restaurants
module.exports.getClosestRestaurantsData = function(req, res) {
  if (req.body && req.body.lat && req.body.lon) {
    request({
      url: baseUrl + '/restavracije/closest',
      qs: {
        lat: req.body.lat,
        lon: req.body.lon
      },
      method: 'get'
    }, function(error, response, body) {
      if (error) {
        getJsonResponse(res, 500, error);
      } else {
        const bodyObj = JSON.parse(body);
        getJsonResponse(res, 200, bodyObj);
      }
    });
  } else {
    getJsonResponse(res, 400, {
      'message': 'Bad request parameters'
    });
  }
}

module.exports.getAllRestaurants = function(req, res) {
  request({
    url: baseUrl + '/restavracije',
    method: 'get'
  }, function(error, response, body) {
    if (error) {
      getJsonResponse(res, 500, error);
    } else {
      const bodyObj = JSON.parse(body);
      getJsonResponse(res, 200, bodyObj);
    }
  });
}

module.exports.getRestaurantById = function(req, res) {
  if (req.params && req.params.idRestaurant) {
    request({
      url: baseUrl + '/restavracije/' + req.params.idRestaurant,
      method: 'get'
    }, function(error, response, body) {
      if (error) {
        getJsonResponse(res, 500, error);
      } else {
        const bodyObj = JSON.parse(body);
        getJsonResponse(res, 200, bodyObj);
      }
    });
  } else {
    getJsonResponse(res, 400, {
      'message': 'Bad request parameters.'
    });
  }
}

module.exports.getRestaurantByName = function(req, res) {
  if (req.params && req.params.nameRestaurant) {
    request({
      url: baseUrl + '/restavracije/name/' + req.params.nameRestaurant,
      method: 'get'
    }, function(error, response, body) {
      if (error) {
        getJsonResponse(res, 500, error);
      } else {
        const bodyObj = JSON.parse(body);
        getJsonResponse(res, 200, bodyObj);
      }
    });
  } else {
    getJsonResponse(res, 400, {
      'message': 'Bad request parameters.'
    });
  }
}

module.exports.getUniqueCities = function(req, res) {
  request({
    url: baseUrl + '/mesta',
    method: 'get'
  }, function(error, response, body) {
    if (error) {
      getJsonResponse(res, 500, error);
    } else {
      const bodyObj = JSON.parse(body);
      getJsonResponse(res, 200, bodyObj);
    }
  });
}

module.exports.getRestaurantsOfCity = function(req, res) {
  if (req.params && req.params.cityName) {
    request({
      url: baseUrl + '/restavracije/mesto' + req.params.cityName,
      method: 'get'
    }, function(error, response, body) {
      if (error) {
        getJsonResponse(res, 500, error);
      } else {
        const bodyObj = JSON.parse(body);
        getJsonResponse(res, 200, bodyObj);
      }
    });
  } else {
    getJsonResponse(res, 400, {
      'message': 'Bad request parameters'
    });
  }
}

