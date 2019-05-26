module.exports.food = function(req, res) {
    res.render('food', {user: require("../models/user"), restaurants: require("../models/food")});
//    res.redirect("/");
};
