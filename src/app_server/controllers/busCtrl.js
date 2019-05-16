var userData = require("../models/user.json");
var busData=require("../models/bus");
var login = require("../straight-as-api/api/controllers/users");

module.exports.bus = function(req, res) {
    res.render('bus', {user: userData, buses: busData});
};

module.exports.busPost = function(req, res) {
    console.log(req.fields);
    res.render('bus', {user: userData, buses: busData});
};
