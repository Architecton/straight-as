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
// var ctrlContacts = require('../controllers/contacts');
var ctrlAuthentication = require('../controllers/authentication');


router.delete('/nukeDB', authentication, ctrlUsers.nukeDB);                                                   // TESTED (13.5.2018)
router.delete('/nukeDBindexes', authentication, ctrlUsers.nukeDBindexes);                                     // TESTED (13.5.2018)

/*



// Controllers for working with loans.
router.get('/inspectLoans', authentication, ctrlLoans.loanGetAll);                                            // TESTED (20.12.2018)
router.post('/users/:idUser/loans', authentication, ctrlLoans.loanCreate);                                    // TESTED (20.12.2018)
router.get('/users/:idUser/loans/:pageIndex', authentication, ctrlLoans.loanGetUsersLoans);                   // TESTED (20.12.2018)
router.get('/users/:idUser/loans/:idLoan', authentication, ctrlLoans.loanGetSelected);                        // TESTED (20.12.2018)
router.put('/users/:idUser/loans/:idLoan', authentication, ctrlLoans.loanUpdateSelected);                     // TESTED (20.12.2018)
router.delete('/users/:idUser/loans/:idLoan', authentication, ctrlLoans.loanDeleteSelected);                  // TESTED (20.12.2018)
router.get('/users/:idUser/loans/:idLoan/chartData', authentication, ctrlLoans.loanGetChartData);             // TESTED (1.1.2019)
router.head('/users/:idUser/loans', authentication, ctrlLoans.loanGetNumUsersLoans);                          // TODO TEST

*/

// Controllers for working with todo lists
router.get('/todolists', authentication, ctrlTodoLists.todoListGetAll);                                       // TESTED (13.5.2019)
router.get('/users/:idUser/todolists/:idTodoList', authentication, ctrlTodoLists.todoListGetSelected);        // TESTED (13.5.2019)
router.post('/users/:idUser/todolists', authentication, ctrlTodoLists.todoListCreate);                        // TESTED (13.5.2019)
router.get('/users/:idUser/todolists', authentication, ctrlTodoLists.todoListGetUsersTodoLists);              // TESTED (13.5.2019)
router.put('/users/:idUser/contacts/:idTodoList/:idTodoListItem', authentication, ctrlTodoLists.todoListUpdateSelected);  // TODO: test after completing below post request handler.
router.delete('/users/:idUser/todolists/:idTodoList', authentication, ctrlTodoLists.todoListDeleteSelected);  // TESTED (13.5.2019)
// router.post('/users/:idUser/todolists/:idTodoList', authentication, ctrlTodoLists.todoListAddItem);           // TODO 14.5.2019



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