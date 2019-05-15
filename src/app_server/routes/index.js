var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET home page. */
router.get('/', ctrlMain.index);

router.get('/login', ctrlMain.login);

router.get('/logout', ctrlMain.logout);

router.get('/food', ctrlMain.food);

router.get('/bus', ctrlMain.bus);

router.get('/events', ctrlMain.events);

router.get('/change_password', ctrlMain.change_password);

router.get('/signup', ctrlMain.signup);

module.exports = router;
