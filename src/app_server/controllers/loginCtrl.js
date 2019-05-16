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
            console.log("Napaka pri prijavi.");
            res.redirect("/login");
        } else {
            const bodyObj = JSON.parse(body);
            console.log("Login success!");
            res.json({
                "JWT_token":bodyObj.token,
                "redirect":"/"
            });
        }
    });
};
