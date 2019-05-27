var todoData = require("../models/todo.json");
var userData = require("../models/user.json");
var todoData = require("../models/todo.json");
var foodData = require("../models/food.json");
var eventData = require("../models/events.json");
var busData = require("../models/bus.json");
var calendarData = null;
var scheduleData = null;


/* IMPORTANT:
    All views MUST receive the userData attribute in their JSON object along with their respective fields.
    If the user is not logged in, the userData attribute should be set to null.
 */

/* GET home page */
module.exports.index = function(req, res) {
    // If user == null -> pug renders only BUS and FOOD else pug renders all RU features
    res.render('index', {user: userData, todo: todoData, calendar: calendarData, schedule: scheduleData});
};

/* GET login page */
module.exports.login = function(req, res) {
    // If user.admin == true -> render 'admin_view'
    // if user.eventAdmin == true -> render 'eventAdmin_view'

    console.log(req.fields);

    res.redirect('/');
}

/* Logout */
module.exports.logout = function(req, res) {
    res.render('index', {user: null});
}

/* Change password */
module.exports.change_password = function(req, res) {
    res.render('change_password', {user: userData});
}

/* GET events page */
module.exports.events = function(req, res) {
    res.render('events', {user: userData, events: eventData});
}

/* POST for new user */