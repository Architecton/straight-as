//var todoData = require("../models/todo.json");
var jwt = require('jsonwebtoken');
const request = require("request");
const querystring = require('querystring');
const baseUrl = "http://localhost:3000";

/* GET home page */
module.exports.index = function (req, res) {
    // If user == null -> pug renders only BUS and FOOD else pug renders all RU features
    let id = verifyJWT(req.query.JWT_token);

    if (!id) {
        res.redirect("login");
        //res.redirect('login');
    } else {
        //dobi podatke o uporabniku
        request({
            url: baseUrl + '/users/' + id,
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + req.query.JWT_token
            }
        }, function (usererror, userresponse, userbody) {
            if (usererror || userresponse.statusCode !== 200) {
                res.render("error", {
                    message: "Napaka pri pridobivanju podatkov o uporabniku.",
                    status: userresponse.statusCode
                });
            } else {
                let userObj = JSON.parse(userbody);
                console.log(userObj);
                //dobi todolist na indeksu 0
                request({
                    url: baseUrl + '/users/' + id + '/todolists',
                    method: 'get',
                    headers: {
                        'Authorization': 'Bearer ' + req.query.JWT_token
                    }
                }, function (todoerror, todoresponse, todobody) {
                    if (todoerror || todoresponse.statusCode !== 200) {
                        res.render("error", {
                            message: "Napaka pri pridobivanju podatkov o todo seznamu.",
                            status: todoresponse.statusCode
                        });
                    } else {
                        let todoObj = JSON.parse(todobody);
                        console.log(todobody);
                        //sestavi objekt, ki bo po strukturi enak todo.json
                        todoObj = todoObj[0];
                        let todoList = {"todoNotes": []};
                        for (let i = 0; i < todoObj.items.length; i++) {
                            todoList.todoNotes.push(
                                {
                                    "content": todoObj.items[i].description,
                                    "_id": todoObj.items[i]._id
                                }
                            );
                        }

                        if (userObj.admin === true) {
                            res.render("admin_panel", {
                                user: {
                                    "username": userObj._id,
                                    "admin": userObj.admin,
                                    "eventAdmin": userObj.eventAdmin
                                }
                            });
                        } else if (userObj.eventAdmin === true) {
                            res.render("events");
                        } else {
                            res.render('index', {
                                user: {
                                    "username": userObj._id,
                                    "admin": userObj.admin,
                                    "eventAdmin": userObj.eventAdmin
                                }, todo: todoList, schedule: require("../models/schedule")
                            });
                        }


                        /*res.render('index', {
                            user: require("../models/user"),
                            todo: require("../models/todo"),
                            schedule: require("../models/schedule")
                        });*/
                    }
                });
            }
        });

    }

};

module.exports.addTodo = (req, res) => {
    id = verifyJWT(req.body.JWT_token);
    if (!id) {
        res.redirect("login");
    } else {
        //dobi id todolista na indeksu 0
        request({
            url: baseUrl + '/users/' + id + '/todolists',
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + req.body.JWT_token
            }
        }, (todoerror, todoresponse, todobody) => {
            if (todoerror || todoresponse.statusCode !== 200) {
                res.render("error", {
                    message: "Napaka pri pridobivanju podatkov o todo seznamu.",
                    status: todoresponse.statusCode
                });
            } else {
                let idFirst = JSON.parse(todobody)[0]._id;

                //shrani nov todo
                request({
                    url: baseUrl + '/users/' + id + '/todolists/' + idFirst,
                    method: 'post',
                    headers: {
                        'Authorization': 'Bearer ' + req.body.JWT_token
                    },
                    form: {
                        "dueDate": Date.now(),
                        "description": req.body.description
                    },
                }, (todoerror2, todoresponse2, todobody2) => {
                    if (todoerror2 || todoresponse2.statusCode !== 201) {
                        res.render("error", {
                            message: "Napaka pri shranjevanju todo seznama.",
                            status: todoresponse2.statusCode
                        });
                    } else {
                        //reload
                        /*const query = querystring.stringify({
                            "JWT_token": req.body.JWT_token
                        });
                        res.redirect("/?" + query);*/
                        res.json({"message": "reload"});
                    }
                })
            }
        })
    }
};

module.exports.deleteTodo = (req, res) => {
    id = verifyJWT(req.body.JWT_token);
    if (!id) {
        res.redirect("login");
    } else {
        //dobi id todolista na indeksu 0
        request({
            url: baseUrl + '/users/' + id + '/todolists',
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + req.body.JWT_token
            }
        }, (todoerror, todoresponse, todobody) => {
            if (todoerror || todoresponse.statusCode !== 200) {
                res.render("error", {
                    message: "Napaka pri pridobivanju podatkov o todo seznamu.",
                    status: todoresponse.statusCode
                });
            } else {
                let idFirst = JSON.parse(todobody)[0]._id;

                //izbriši todo
                request({
                    url: baseUrl + '/users/' + id + '/todolists/' + idFirst + "/" + req.body.todoID,
                    method: 'delete',
                    headers: {
                        'Authorization': 'Bearer ' + req.body.JWT_token
                    },
                }, (todoerror2, todoresponse2, todobody2) => {
                    if (todoerror2 || todoresponse2.statusCode !== 204) {
                        res.render("error", {
                            message: "Napaka pri brisanju todo zapisa.",
                            status: todoresponse2.statusCode
                        });
                    } else {
                        //reload
                        /*const query = querystring.stringify({
                            "JWT_token": req.body.JWT_token
                        });*/
                        res.json({"message": "reload"});
                    }
                })
            }
        })
    }
};

function verifyJWT(JWT_token) {
    if (!JWT_token) {
        return false;
        //res.redirect('login');
    } else {
        //dekodiraj token, dobi id in preko tega ostale podatke
        let decoded = jwt.decode(JWT_token);
        return decoded.id;
    }
}
