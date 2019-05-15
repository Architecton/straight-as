var login = require("./../straight-as-api/api/controllers/authentication");

module.exports.loginPage = function (req, res) {
    res.render('login', null);
};

module.exports.login = function (req, res) {
    Console.log(req.body);
};
