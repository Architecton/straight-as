var jwt = require('jsonwebtoken');
const request = require("request");
const baseUrl = "http://localhost:3000";

module.exports.food = function (req, res) {
    let id = verifyJWT(req.query.JWT_token);
    console.log(req.body);
    if (!id) {
        res.render("food", {
            user: null
        });
    } else {
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
                //console.log(userObj);

                res.render('food', {
                    user: {
                        "username": userObj._id,
                        "admin": userObj.admin,
                        "eventAdmin": userObj.eventAdmin
                    }
                });
            }
        });
    }
};

module.exports.location = function (req, res) {
    request({
        url: "https://tpo-api-restavracije.herokuapp.com//restavracije/closest/" + req.body.sort + "?lat=" + req.body.lat + "&lon=" + req.body.lon,
        method: 'get'
    }, function (reserror, resresponse, resbody) {
        if (reserror || resresponse.statusCode !== 200) {
            res.render("error", {
                message: "Napaka pri pridobivanju podatkov o restavracijah.",
                status: resresponse.statusCode
            });
        } else {
            let resObj = JSON.parse(resbody);
            //console.log(resObj);
            res.json(resObj);
        }
    });
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


