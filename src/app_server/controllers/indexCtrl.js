//var todoData = require("../models/todo.json");
var todoData = require("../straight-as-api/api/controllers/todoLists");
var userData = require("../straight-as-api/api/controllers/users");
var calendarData = null;
var scheduleData = null;

/* GET home page */
module.exports.index = function (req, res) {
    // If user == null -> pug renders only BUS and FOOD else pug renders all RU features
    res.render('index', {
        user: userData.userGetSelected(req,res),
        todo: todoData.todoListGetUsersTodoLists(req,res),
        calendar: calendarData,
        schedule: scheduleData
    });
};
