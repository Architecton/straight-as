var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');
var ctrlService = require('../controllers/service');
var indexCtrl = require('../controllers/indexCtrl');

/* GET home page. */
router.get('/', indexCtrl.index);

router.get('/login', ctrlMain.login);

router.post('/login', ctrlService.login);

router.get('/logout', ctrlMain.logout);

router.get('/food', ctrlMain.food);

router.get('/bus', ctrlMain.bus);

router.post('/bus', ctrlService.bus);

router.get('/events', ctrlMain.events);

router.get('/change_password', ctrlMain.change_password);

router.get('/signup', ctrlMain.signup);

router.post('/signup', ctrlService.signup);

module.exports = router;
