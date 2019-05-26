const jwt = require('jsonwebtoken');
const request = require("request");
const querystring = require('querystring');
const baseUrl = "http://localhost:3000";

module.exports.signup = function (req, res) {
    res.render('signup', null);
};

module.exports.signupPost = function (req, res) {
    //console.log(req.body);
    request({
        url: baseUrl + '/users/',
        method: 'post',
        form: {
            "email": req.body.email,
            "password": req.body.password
        }
    }, (todoerror, todoresponse, todobody) => {
        if (todoerror || todoresponse.statusCode !== 200) {
            res.render("error", {
                message: "Napaka pri registraciji.",
                status: todoresponse.statusCode
            });
        } else {
            res.json({"message": "redirect"});
        }
    })
    //res.render('signup', null);
};

module.exports.change_password = function (req, res) {
    res.render('change_password', {user: userData});
};

module.exports.change_passwordPost = function (req, res) {
    res.redirect("/");
};
