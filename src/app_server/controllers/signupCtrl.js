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
        headers: {
            "Content-Type": "application/json"
        },
        form: {
            "email": req.body.email,
            "password1": req.body.password1,
            "password2": req.body.password2
        }
    }, (todoerror, todoresponse, todobody) => {
        if (todoerror || todoresponse.statusCode !== 201) {
            res.render("error", {
                message: "Napaka pri registraciji.",
                status: todoresponse.statusCode
            });
        } else {
            res.render("login");
        }
    })
    //res.render('signup', null);
};

module.exports.change_password = function (req, res) {
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

                res.render('change_password', {
                    user: {
                        "username": userObj._id,
                        "admin": userObj.admin,
                        "eventAdmin": userObj.eventAdmin
                    }
                });
            }
        })
    }
};

module.exports.change_passwordPost = function (req, res) {
    let id = verifyJWT(req.body.JWT_token);

    if (!id) {
        res.redirect("login");
        //res.redirect('login');
    } else {
        //dobi podatke o uporabniku
        request({
            url: baseUrl + '/users/' + id,
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + req.body.JWT_token
            }
        }, function (usererror, userresponse, userbody) {
            if (usererror || userresponse.statusCode !== 200) {
                res.render("error", {
                    message: "Napaka pri pridobivanju podatkov o uporabniku.",
                    status: userresponse.statusCode
                });
            } else {
                let userObj = JSON.parse(userbody);

                //zamenjaj geslo
                //api klic ne obstaja
                res.render("login");
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
