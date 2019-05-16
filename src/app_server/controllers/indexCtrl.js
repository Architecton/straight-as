//var todoData = require("../models/todo.json");
var jwt = require('jsonwebtoken');
const request = require("request");
const baseUrl = "http://localhost:3000";

/* GET home page */
module.exports.index = function (req, res) {
    // If user == null -> pug renders only BUS and FOOD else pug renders all RU features
    if (!req.query.JWT_token) {
        //res.render('index', {user: null});
        res.redirect('login');
    } else {
        //dekodiraj token, dobi id in preko tega ostale podatke
        var decoded = jwt.decode(req.query.JWT_token);
        var id = decoded.id;

        var userData = require("../models/todo");
        var todoData = require("../models/todo");
        var callendarData = null;
        var scheduleData = null;

        //dobi podatke o uporabniku
        request({
            url: baseUrl + '/users/' + id,
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + req.query.JWT_token
            }
        }, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                console.log("Napaka pri pridobivanju podatkov o uporabniku.");
                res.redirect("/login");
            } else {
                const bodyObj = JSON.parse(body);
                //console.log(bodyObj);
                userData = bodyObj;

                res.render('index', {
                    user: {
                        "username": userData._id,
                        "admin": userData.admin,
                        "eventAdmin": userData.eventAdmin
                    }, todo: todoData, calendar: callendarData, schedule: scheduleData
                });
            }
        });
    }

};
