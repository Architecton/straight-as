var jwt = require('jsonwebtoken');
const request = require("request");
const baseUrl = "http://localhost:3000/";

module.exports.bus = function (req, res) {
    let id = verifyJWT(req.body.JWT_token);
    console.log(req.body);
    if (!id) {
        res.render("bus", {
                        user: null,
                        busData: null});
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

                res.render({user: {
                                "username": userObj._id,
                                "admin": userObj.admin,
                                "eventAdmin": userObj.eventAdmin
                            },
                            busData: null});
            }
        });
    }
};

module.exports.busPost = function (req, res) {
    let id = verifyJWT(req.body.JWT_token);
    console.log(req.body);
    if (!id) {
        request({
            url: "https://tpo-api-lpp.herokuapp.com/station/arrivals/" + req.body.station,
            method: 'get'
        }, function (buserror, busresponse, busbody) {
            if (buserror || busresponse.statusCode !== 200) {
                res.render("error", {
                    message: "Napaka pri pridobivanju podatkov o avtobusih.",
                    status: busresponse.statusCode
                });
            } else {
                let busObj = JSON.parse(busbody);

                console.log(busObj);
                res.render("bus", {
                    user: null,
                    busData: busObj});
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

                request({
                    url: "https://tpo-api-lpp.herokuapp.com/sation/arrivals/" + req.body.station,
                    method: 'get'
                }, function (buserror, busresponse, busbody) {
                    console.log(busbody);
                    if (buserror || busresponse.statusCode !== 200) {
                        res.render("error", {
                            message: "Napaka pri pridobivanju podatkov o avtobusih.",
                            status: busresponse.statusCode
                        });
                    } else {
                        let busObj = JSON.parse(busbody);
                        res.render("bus", {
                            user: {
                                "username": userObj._id,
                                "admin": userObj.admin,
                                "eventAdmin": userObj.eventAdmin
                            },
                            busData: busObj});
                    }
                });

            }
        });
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