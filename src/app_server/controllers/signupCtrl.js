var userData = require("../models/user.json");


module.exports.signup = function(req, res) {
    res.render('signup', null);
};

module.exports.signupPost = function(req, res) {
    console.log(req.fields);
    res.render('signup', null);
};

module.exports.change_password = function(req, res) {
    res.render('change_password', {user: userData});
};

module.exports.change_passwordPost = function(req, res) {
    res.redirect("/");
};
