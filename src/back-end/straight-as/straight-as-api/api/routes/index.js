var express = require('express');
var jwt = require('express-jwt');
var router = express.Router();

var authentication = jwt({
    secret: process.env.JWT_PASSWORD,
    userProperty: 'payload'
});

// controller modules
var ctrlUsers = require('../controllers/users');
var ctrlTodoLists = require('../controllers/todoLists');
var ctrlAuthentication = require('../controllers/authentication');


router.delete('/nukeDB', authentication, ctrlUsers.nukeDB);                                                   // TESTED (13.5.2018)
router.delete('/nukeDBindexes', authentication, ctrlUsers.nukeDBindexes);                                     // TESTED (13.5.2018)

// Controllers for working with todo lists
router.get('/todolists', authentication, ctrlTodoLists.todoListGetAll);                                       				// TESTED (13.5.2019)
router.get('/users/:idUser/todolists/:idTodoList', authentication, ctrlTodoLists.todoListGetSelected);        				// TESTED (13.5.2019)
router.post('/users/:idUser/todolists', authentication, ctrlTodoLists.todoListCreate);                        				// TESTED (13.5.2019)
router.get('/users/:idUser/todolists', authentication, ctrlTodoLists.todoListGetUsersTodoLists);             				// TESTED (13.5.2019)
router.put('/users/:idUser/todolists/:idTodoList/:idTodoListItem', authentication, ctrlTodoLists.todoListUpdateSelected);  		// TESTED (14.5.2019)
router.delete('/users/:idUser/todolists/:idTodoList', authentication, ctrlTodoLists.todoListDeleteSelected);  					// TESTED (13.5.2019)
router.post('/users/:idUser/todolists/:idTodoList', authentication, ctrlTodoLists.todoListAddItem);           					// TESTED (14.5.2019)
router.get('/users/:idUser/todolists/:idTodoList/:idTodoListItem', authentication, ctrlTodoLists.todoListGetItem)               // TESTED (14.5.2019)
router.delete('/users/:idUser/todolists/:idTodoList/:idTodoListItem', authentication, ctrlTodoLists.todoListDeleteItem)         // TESTED (14.5.2019)
router.post('/users/:idUser/todolists/:idTodoList/:idTodoListItem/s', authentication, ctrlTodoLists.todoListItemSetCompletion)  // TESTED (14.5.2019)



// Controllers for authentication
router.post('/users', ctrlAuthentication.authSignUp);                                                       // TESTED (13.5.2018)
router.post('/users/login', ctrlAuthentication.authLogIn);                                                  // TESTED (13.5.2018)
router.get('/users/:idUser/:validationCode', ctrlAuthentication.authConfirm);                               // TESTED (13.5.2018)    


// Controlers for working with users
router.get('/users', ctrlUsers.userGetAll);                                                                 // TESTED (13.5.2019)
router.get('/users/:idUser', authentication, ctrlUsers.userGetSelected);                                    // TESTED (13.5.2019)
router.delete('/users/:idUser', authentication, ctrlUsers.userDeleteSelected);                              // TESTED (13.5.2019)

// Expose router as module.
module.exports = router;

// Detect presence of administrator account. If such an account is not found then it is
// initialized from data specified in .env file.
ctrlAuthentication.initAdmins(process.env.ADMIN_EMAIL);

