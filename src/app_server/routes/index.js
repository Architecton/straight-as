var express = require('express');
var router = express.Router();

var indexCtrl = require('../controllers/indexCtrl');
var loginCtrl = require("../controllers/loginCtrl");
var logoutCtrl = require("../controllers/logoutCtrl");
var foodCtrl = require("../controllers/foodCtrl");
var busCtrl = require("../controllers/busCtrl");
var eventCtrl = require("../controllers/eventCtrl");
var signupCtrl = require("../controllers/signupCtrl");


/* GET home page. */
router.get('/', indexCtrl.index);
//dodaj nov todo zapis
router.post('/addtodo', indexCtrl.addTodo);
//odstrani obstoječ zapis
router.post("/deletetodo", indexCtrl.deleteTodo);
//spremeni zapis
router.post("/edittodo", indexCtrl.editTodo);

router.get('/login', loginCtrl.login);

router.post('/login', loginCtrl.loginPost);

router.get('/logout', logoutCtrl.logout);

router.get('/food', foodCtrl.food);

router.get('/bus', busCtrl.bus);

router.post('/bus', busCtrl.busPost);

router.get('/events', eventCtrl.events);

router.get('/change_password', signupCtrl.change_password);

router.post('/change_password', signupCtrl.change_passwordPost);

router.get('/signup', signupCtrl.signup);

router.post('/signup', signupCtrl.signupPost);

module.exports = router;
