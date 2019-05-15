//var todoData = require("../models/todo.json");
var todoData = require("../models/todo");
var userData = require("../models/user");
var calendarData = null;
var scheduleData = null;

/* GET home page */
module.exports.index = function (req, res) {
    // If user == null -> pug renders only BUS and FOOD else pug renders all RU features
    if(!user){
        user=null;
    }
    res.render('index', {
        user: userData,
        todo: todoData,
        calendar: calendarData,
        schedule: scheduleData
    });
};
