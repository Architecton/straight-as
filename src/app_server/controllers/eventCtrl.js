var jwt = require('jsonwebtoken');
const request = require("request");
const querystring = require('querystring');
const baseUrl = "http://localhost:3000";


module.exports.events = function(req, res) {
    let id = verifyJWT(req.body.JWT_token);
    console.log(req.body);
    if (!id) {
        res.render("events", {
            user: null,
            events: {
                "events": []
            }
        });
    } else {
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
                console.log(userObj);

                res.render('events', {user: {
                        "username": userObj._id,
                        "admin": userObj.admin,
                        "eventAdmin": userObj.eventAdmin
                        },
                        events: {
                            "events": []
                        }
                });
            }
        });
    }
};


module.exports.newEvent = function(req, res) {
    id = verifyJWT(req.body.JWT_token);
    if (!id) {
        res.redirect("login");
    } else {
        //dobi id todolista na indeksu 0
        request({
            url: baseUrl + '/events/' + id,
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + req.body.JWT_token
            },
            form: {
                "description": req.body.description,
                "title": req.body.title,
                "organizer": req.body.organizer,
                "date": req.body.date
            }
        }, (eventerror, eventresponse, eventbody) => {
            if (eventerror || eventresponse.statusCode !== 200) {
                res.render("error", {
                    message: "Napaka pri kreiranju dogodka.",
                    status: eventresponse.statusCode
                });
            } else {
                res.json({"message": "reload"});
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