var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');
var ctrlIndex = require('../controllers/indexCtrl');
var ctrlLogin = require("../controllers/loginCtrl");

/* GET home page. */
router.get('/', ctrlIndex.index);

router.get('/login', ctrlLogin.loginPage);

router.post('/login', ctrlLogin.login);

router.get('/logout', ctrlMain.logout);

router.get('/food', ctrlMain.food);

router.get('/bus', ctrlMain.bus);

router.get('/events', ctrlMain.events);

router.get('/change_password', ctrlMain.change_password);

router.get('/signup', ctrlMain.signup);

module.exports = router;
