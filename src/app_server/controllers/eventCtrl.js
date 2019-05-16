module.exports.events = function(req, res) {
    res.render('events', {user: userData, events: eventData});
};
