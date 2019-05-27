"use strict";

const request = require('request');
const baseUrl = "http://localhost:3000";

module.exports.login = function (req, res) {
    res.render('login', null);
};

module.exports.loginPost = function (req, res) {
    request({
        url: baseUrl + '/users/login',
        method: 'post',
        form: {
            email: req.body.email,
            password: req.body.password
        }
    }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            res.render("error", {message: "Napaka pri prijavi.", status: response.statusCode});
        } else {
            const bodyObj = JSON.parse(body);
            console.log("Login success!");

            //preveri, če uporabnik že ima kak todoList
            request({
                url: baseUrl + '/users/' + req.body.email + '/todolists',
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + bodyObj.token
                }
            }, (todoerror, todoresponse, todobody) => {
                if (todoerror || todoresponse.statusCode !== 200) {
                    res.render("error", {
                        message: "Napaka pri pridobivanju podatkov o todo seznamu.",
                        status: todoresponse.statusCode
                    });
                } else {
                    let todoLists = JSON.parse(todobody);

                    //če je todoLists prazen, potem ustvari novega
                    if (todoLists.length === 0) {
                        request({
                            url: baseUrl + '/users/' + req.body.email + '/todolists',
                            method: 'post',
                            headers: {
                                'Authorization': 'Bearer ' + bodyObj.token
                            }
                        }, (todolisterror, todolistresponse, todolistbody) => {
                            if (todolisterror || todolistresponse.statusCode !== 201) {
                                res.render("error", {
                                    message: "Napaka pri kreiranju todo seznama.",
                                    status: todolistresponse.statusCode
                                });
                            } else {
                                res.json({
                                    "JWT_token": bodyObj.token,
                                    "redirect": "/"
                                });
                            }
                        })
                    } else {
                        res.json({
                            "JWT_token": bodyObj.token,
                            "redirect": "/"
                        });
                    }
                }
            })
        }
    });
};
