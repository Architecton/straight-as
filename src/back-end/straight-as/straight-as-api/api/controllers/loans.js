var mongoose = require('mongoose');
var User = mongoose.model('User');


// getJsonResponse: take response, status and JSON data and add status and data to response.
var getJsonResponse = function(response, status, data) {
  // Add status and JSON to response.
  response.status(status);
  response.json(data);
};


/*
IMPLEMENTED
router.get('/loans', ctrlLoans.loanGetAll);
router.post('/user/:idUser/loans', ctrlLoans.loanCreate);
router.get('/user/:idUser/loans/:idLoan', ctrlLoans.loanGetSelected);
router.put('/user/:idUser/loans/:idLoan', ctrlLoans.loanUpdateSelected);
router.delete('/user/:idUser/loans/:idLoan', ctrlLoans.loanDeleteSelected);
*/

// GET ALL LOANS OF ALL USERS //////////////////////////////////////////////////


// ** loanGetAll: get all loans
module.exports.loanGetAll = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    // Only admin allowed.
    if (username == process.env.ADMIN_USERNAME){
      User
        .find({})
        .exec(function(error, users) {
          if (!users) {  // If user not found
            getJsonResponse(response, 404, {
              "message": 
                "Cannot find user with given identifier idUser."
            });
            return;
          // if error while executing function
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          
          // get loans of all users and concatenate in array and return as response.
          var loans = [];
          users.forEach(function(e) {
            loans = loans.concat(e.loans);
          });
          
          // return array of loans.
          getJsonResponse(response, 200, loans);
        });
    } else {
      getJsonResponse(response, 401, {"message" : "not authorized"});
    }
  });
};

////////////////////////////////////////////////////////////////////////////////

// MANAGING LOANS //////////////////////////////////////////////////////////////

// loanCreate: create new loan for user with specified idUser (username)
module.exports.loanCreate = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    // get idUser from request parameters.
    var idUser = request.params.idUser;
    // if idUser not null and idUser is same as the username in the JWT
    if (idUser && idUser == username) {
      User
        .findById(idUser)
        .select('loans')
        .exec(
          function(error, user) {
            // if encountered error
            if (error) {
              getJsonResponse(response, 500, error);
            } else {
              // add loan to user (see auxiliary function below)
              addLoan(request, response, user);
            }
          }
        );
        // if user not found
    } else {
      getJsonResponse(response, 400, {
        "message": 
          "Cannot find user."
      });
    }
  });
};

// *** AUXILIARY FUNCTIONS *** //

// ** addLoan: add new loan to user with specified id.
var addLoan = function(request, response, user) {
  if (!user) {
    getJsonResponse(response, 404, {
      "message": "Cannot find user."
    });
  } else {
    // Create new loan from properties in body.
    var newLoan = {
        loaner: request.body.loaner,
        recipient: request.body.recipient,
        dateIssued: new Date().toJSON().slice(0,10).replace(/-/g,'-'),
        deadline: request.body.deadline,
        amount: request.body.amount,
        currency: request.body.currency,
        interest: request.body.interest,
        payment_interval: request.body.payment_interval,
        payment_amount: request.body.payment_amount,
        compoundInterest: request.body.compoundInterest,
        interest_on_debt: request.body.interest_on_debt,
        status: 'pending'
    };
    
    
    // Check if loan recipient is in contacts.
    recipientInContacts(newLoan.loaner, newLoan.recipient).then(function(result) {
      if(result) {
        // Validate loan.
        validateLoan(newLoan).then(function(result) {
          // If loan is valid.
          if (result) {
            user.loans.push(newLoan);
            user.save(function(error, user) {
              var addedLoan;
              // if encountered error
              if (error) {
                getJsonResponse(response, 400, error);
              } else {
                // Add loan to recipient's list of loans.
                User
                .findById(newLoan.recipient)
                .select('loans')
                .exec(
                  function(error, user) {
                    // if encountered error
                    if (error) {
                      getJsonResponse(response, 500, error);
                    } else {
                      // add loan to user (see auxiliary function below)
                      user.loans.push(newLoan);
                      user.save(function(error, user) {
                        if (error) {
                          getJsonResponse(response, 400, error);
                        } else {
                          console.log("Successfuly pushed loan to contact.");
                        }
                      });
                    }
                  }
                );
                // Get loan that was just added and return it as reponse.
                addedLoan = user.loans[user.loans.length - 1];
                getJsonResponse(response, 201, addedLoan);
              }
            });
          } else {
            // If loan is invalid
            getJsonResponse(response, 400, {
              "message": "Invalid loan parameters"
            });
          }
        });
      } else {
        // If loan is invalid
        getJsonResponse(response, 400, {
          "message": "Recipient must be in contacts."
        });
      }
    });
  }
};

// *************************** //


// ** loanUpdateSelected: update loan with specified loanID of user with specified username
module.exports.loanUpdateSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    // if request does not contain user's id or loan's id or if the idUser is not same as the username in the JWT
    if (!request.params.idUser || !request.params.idLoan || request.params.idUser != username) {
      getJsonResponse(response, 400, {
        "message":"Bad request parameters"
      });
      return;
    }
    User
      .findById(request.params.idUser)
      .select('loans')
      .exec(
        function(error, user) {
          // If user with specified username does not exist.
          if (!user) {
            getJsonResponse(response, 404, {
              "message": "Cannot find user"
            });
            return;
          // If encountered error
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          // If user has property loans and there is at least one loan
          if (user.loans && user.loans.length > 0) {
            // Get loan to be updated.
            var updatedLoan = 
              user.loans.id(request.params.idLoan);
            // if loan with given id not found
            if (!updatedLoan) {
              getJsonResponse(response, 404, {
                "message": "Cannot find loan with given loanID."
              });
            } else {
              // check if status code is valid
              if((request.body.status === 'active' && updatedLoan.status == 'pending') || (request.body.status === 'resolved' && updatedLoan.status == 'active')) {
                updatedLoan.status = request.body.status;  
              } else {
                getJsonResponse(response, 400, {
                  "message": "Invalid status change request"
                });
                return;
              }
              // Save modified user.
              user.save(function(error, user) {
                // if encountered error
                if (error) {
                  getJsonResponse(response, 400, error);
                // If success, return updated loan.
                } else {
                  getJsonResponse(response, 200, updatedLoan);
                }
              });
            }
          // if user does not have property loans or user has no loans
          } else {
            getJsonResponse(response, 404, {
              "message": "Cannot find loans to update."
            });
          }
        }
      );
  });
};

// ** loanDeleteSelected: delete loan od user with specified username with specified loanID.
module.exports.loanDeleteSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    // if idUser or idLoan are missing or if idUser is not same as the username in the JWT
    if (!request.params.idUser || !request.params.idLoan || request.params.idUser != username) {
      getJsonResponse(response, 400, {
        "message":"Bad request parameters"
      });
      return;
    }
    User
      .findById(request.params.idUser)
      .exec(
        function(error, user) {
          // If user not found
          if (!user) {
            getJsonResponse(response, 404, {
              "message": "Cannot find user"
            });
            return;
          // If encountered error
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          // If user has property loans and there is at least one loan.
          if (user.loans && user.loans.length > 0) {
            // If no loan with specified loanID
            if (!user.loans.id(request.params.idLoan)) {
              getJsonResponse(response, 404, {
                "message": "Cannot find loan."
              });
            } else {
              // Remove loan with specified loanID.
              user.loans.id(request.params.idLoan).remove();
              // Save user.
              user.save(function(error) {
                // if encountered error
                if (error) {
                  getJsonResponse(response, 500, error);
                } else {
                  // gone
                  getJsonResponse(response, 204, null);
                }
              });
            }
          } else {
            // If loan with specified loanID not found, return error message.
            getJsonResponse(response, 404, {
              "message": "No loan to delete"
            });
          }
        }
      );
  });
};

////////////////////////////////////////////////////////////////////////////////


// ** loanGetUsersLoans: get all loans of user with given id
module.exports.loanGetUsersLoans = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    // if request has parameters, the parameters include idUser and idUser is the same as the username in JWT
    if (request.params && request.params.idUser && request.params.idUser == username) {
      User
        .findById(request.params.idUser)
        .exec(function(error, user) {
          if (!user) {  // If user not found
            getJsonResponse(response, 404, {
              "message": 
                "Cannot find user with given identifier idUser."
            });
            return;
          // if error while executing function
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          // If path parameters include the index of the page to return.
          if (request.params.pageIndex) {
            // Get specified page of loans.
            var pageIndex = request.params.pageIndex;
            
            // set default API-side filter.
            var filt = function (loan) { return true };
            if (request.headers.filtidx && request.headers.filtidx == '0' || 
            request.headers.filtidx == '1' || request.headers.filtidx == '2' 
            || request.headers.filtidx == '3') {
              if (user.loans.length > 0) {
                switch (request.headers.filtidx) {
                  case '0':     // no filter
                    filt = function (loan) { return true };
                    break;
                  case '1':     // pending
                    filt = function (loan) { return  loan.status == 'pending' };
                    break;
                  case '2':     // active
                    filt = function (loan) { return  loan.status == 'active' };
                    break;
                  case '3':     // resolved
                    filt = function (loan) { return loan.status == 'resolved' };
                    break;
                  default:
                    filt = function (loan) { return true };
                }
              }
              // filter loans with specified filter.
              var filtered_loans = user.loans.filter(filt);
              // Perform pagination.
              var loans = filtered_loans.slice(pageIndex*10, pageIndex*10+10);
              // Set header value
              response.set("numLoans", [user.loans.length]);
              getJsonResponse(response, 200, loans);
            } else {
              getJsonResponse(response, 400, {
                "message" : "Bad filterIndex header"
              }) ;
            }
          } else {
            getJsonResponse(response, 400, {
              "message" : "Missing page index path parameter"
            }) ;
          }
        });
    // else if no parameters or if parameters do not include idUser
    } else {
      getJsonResponse(response, 400, { 
        "message": "identifier idUser is missing."
      });
    }
  });
};



// ** loanGetUsersLoans: get number of loans of user with given id
module.exports.loanGetNumUsersLoans = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    // if request has parameters, the parameters include idUser and idUser is the same as the username in JWT
    if (request.params && request.params.idUser && request.params.idUser == username) {
      User
        .findById(request.params.idUser)
        .exec(function(error, user) {
          if (!user) {  // If user not found
            getJsonResponse(response, 404, {
              "message": 
                "Cannot find user with given identifier idUser."
            });
            return;
          // if error while executing function
          } else if (error) {
            getJsonResponse(response, 500, error);
            return;
          }
          
          // user's loans
          var loans = user.loans;
          
          if (request.headers.statusfilt && request.headers.statusfilt == 'pending' ||
          request.headers.statusfilt == 'active' || request.headers.statusfilt == 'resolved' ||
          request.headers.statusfilt == 'none') {
            var filt = function (loan) { return loan.status == 'pending' };
            switch (request.headers.statusfilt) {
              case 'pending':
                filt = function (loan) { return loan.status == 'pending' };
                break;
              case 'active':
                filt = function (loan) { return loan.status == 'active' };
                break;
              case 'resolved':
                filt = function (loan) { return loan.status == 'resolved' };
                break;
              case 'none':
                filt = function (loan) { return true };
                break;
              default:
                filt = function (loan) { return loan.status == 'pending' };
                break;
            }
            // Apply filter
            loans = loans.filter(filt);
          }
          
          // Set header value and return response.
          response.set("numLoans", [loans.length]).send();
        });
    // else if no parameters or if parameters do not include idUser
    } else {
      getJsonResponse(response, 400, { 
        "message": "identifier idUser is missing."
      });
    }
  });
};



// ** loanGetSelected: get loan with specified id of user with specified user id (username)
module.exports.loanGetSelected = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    // If request has parameters and they include user id and loan id and idUser 
    // is the same as the username in the JWT
    if (request.params && request.params.idUser && request.params.idLoan && request.params.idUser == username) {
      // Find user by id.
      User
        .findById(request.params.idUser)
        .select('_id loans')
        .exec(
          function(error, user) {
            var loan;
            // if user not found
            if (!user) {
              getJsonResponse(response, 404, {
                "message": 
                  "Cannot find user with specified id."
              });
              return;
              // if encountered error
            } else if (error) {
              getJsonResponse(response, 500, error);
              return;
            }
            // if user has at least one loan
            if (user.loans && user.loans.length > 0) {
              loan = user.loans.id(request.params.idLoan);
              // if loan with specified id not found
              if (!loan) {
                getJsonResponse(response, 404, {
                  "message": 
                    "Cannot find loan with specified id."
                });
              // If loan with specified id is found, return it.
              } else {
                getJsonResponse(response, 200, loan);
              }
            } else {
              // If loans not found.
              getJsonResponse(response, 404, {
                "message": "Cannot find any loans."
              });
            }
          }
        );
    } else {
      // else if request parameters were invalid
      getJsonResponse(response, 400, {
        "message": 
          "Invalid request parameters."
      });
    }
  });
};


module.exports.loanGetChartData = function(request, response) {
  getLoggedId(request, response, function(request, response, username) {
    if (!request.params.idUser || !request.params.idLoan || request.params.idUser != username) {
      getJsonResponse(response, 400, {
        "message":"Bad request parameters"
      });
      return;
    } else {
      User
        .findById(request.params.idUser)
        .select('_id loans')
        .exec(
          function(error, user) {
            var loan;
            // if user not found
            if (!user) {
              getJsonResponse(response, 404, {
                "message": 
                  "Cannot find user with specified id."
              });
              return;
              // if encountered error
            } else if (error) {
              getJsonResponse(response, 500, error);
              return;
            }
            // if user has at least one loan
            if (user.loans && user.loans.length > 0) {
              loan = user.loans.id(request.params.idLoan);
              // if loan with specified id not found
              if (!loan) {
                getJsonResponse(response, 404, {
                  "message": 
                    "Cannot find loan with specified id."
                });
              // If loan with specified id is found, return it.
              } else {
                getDebtByTime(loan).then(function success(result) {
                  getJsonResponse(response, 200, result);
                }, function error(result) {
                  getJsonResponse(response, 404, {
                    "message": 
                      "Error retrieving loan data"
                  });
                });
              }
            } else {
              // If loans not found.
              getJsonResponse(response, 404, {
                "message": "Cannot find any loans."
              });
            }
          }
        );
    }
  });
};


var getDebtByTime = function(loan) {
  return new Promise(function(resolve, reject) {
    resolve(debtByTime(new Date(loan.dateIssued), new Date(loan.deadline),
    Number(loan.payment_interval), Number(loan.payment_amount), Number(loan.amount), 
    Number(loan.interest), Boolean(loan.compoundInterest), Boolean(loan.interest_on_debt)));
  });
};


// debt_by_time: compute debt as a function of time

// start_date: date at which interest starts accumulating (Date instance)
// end_date: date at which loan is repaid (Date instance)
// payment_interval: interval at which an amount is paid
// payment_amount: repayment amount
// principal_amount: loan size
// interest_rate: rate of interest
// type_intereset: type of interest - possible values: 'simple', 'compound' (true, false)
// interest_on_principal: compute interest on current debt or on principal amount (true or false)

// note: this function can also be used to compute the validity of the loan contract (if the debt will be repaid in the given)
function debtByTime(start_date, end_date, payment_interval, payment_amount, principal_amount, interest_rate, type_interest, interest_on_debt) {
  
  // compute_days: compute days between passed dates.
  function compute_days(start_date, end_date) {
      // Take the difference between the dates and divide by milliseconds per day.
      // Round to nearest whole number to deal with daylight saving time.
      return Math.round((end_date - start_date)/(1000*60*60*24));
  }
  
  // Compute number of days  between starting and ending date.
  var num_days = compute_days(start_date, end_date);
  
  // Compute daily interest percentage
  var daily_interest = interest_rate / (12*32);
  
  // Total interest accumulated
  var interest_accumulated = 0;
  var interest_accumulated_by_day = new Array(num_days);
  
  // Allocate arrays for storing the dependent and independent variable values.
  // Array representing the index of the current day (x-axis).
  var day = new Array(num_days);
  
  // Array representing the total debt on a given day (y-axis).
  var debt_per_day = new Array(num_days);
  
  // if computing interest on current debt
  if (interest_on_debt) {
      // if simple interest
      if (!type_interest) {
          // Compute total debt for each day.
          var debt = principal_amount;
          var interval_count = 0;
          var interest;
          for(var i = 1; i <= num_days; i++) {
              interest = principal_amount*daily_interest;
              debt = debt + interest;
              interest_accumulated = interest_accumulated + interest;
              interest_accumulated_by_day[i-1] = interest_accumulated;
              interval_count++;
              // If payment day...
              if (interval_count == payment_interval) {
                  principal_amount -= Math.min(payment_amount, principal_amount);
                  debt -= Math.min(payment_amount, debt);
                  interval_count = 0;
              }
              
              // Add results to arrays storing the independent and dependent variable values.
              day[i-1] = i;
              debt_per_day[i-1] = debt;
          }


      // if compound interest
      } else if (type_interest) {
          // Compute total debt for each day.
          var debt = principal_amount;
          var interval_count = 0;
          var interest;
          for(var i = 1; i <= num_days; i++) {
              interest = debt*daily_interest;
              debt += interest;
              interest_accumulated = interest_accumulated + interest;
              interest_accumulated_by_day[i-1] = interest_accumulated;
              interval_count++;
              // if payment day
              if (interval_count == payment_interval) {
                  debt -= Math.min(payment_amount, debt);
                  interval_count = 0;
              }
              // Add results to arrays storing the independent and dependent variable values.
              day[i-1] = i;
              debt_per_day[i-1] = debt;
          }
          
      } else {
          throw "Invalid interest type";
      }
      
  // If computing interest on principal amount
  } else {
      // if compound interest
      if (!type_interest) {

          // Compute total debt for each day.
          var debt = principal_amount;
          var interval_count = 0;
          var interest;
          for(var i = 1; i <= num_days; i++) {
              interest = principal_amount*daily_interest;
              debt += interest;
              interest_accumulated = interest_accumulated + interest;
              interest_accumulated_by_day[i-1] = interest_accumulated;
              interval_count++;
              // If payment day...
              if (interval_count == payment_interval) {
                  debt -= Math.min(payment_amount, debt);
                  interval_count = 0;
              }
              
              // Add results to arrays storing the independent and dependent variable values.
              day[i-1] = i;
              debt_per_day[i-1] = debt;
          }
       
      // if simple interest
      } else if (type_interest) {
       
        // Compute total debt for each day.
          var debt = principal_amount;
          var interval_count = 0;
          var interest;
          for(var i = 1; i <= num_days; i++) {
              interest = principal_amount*daily_interest;
              principal_amount += interest;
              debt += interest;
              interest_accumulated = interest_accumulated + interest;
              interest_accumulated_by_day[i-1] = interest_accumulated;
              interval_count++;
              // if payment day
              if (interval_count == payment_interval) {
                  debt -= Math.min(payment_amount, debt);
                  interval_count = 0;
              }
              // Add results to arrays storing the independent and dependent variable values.
              day[i-1] = i;
              debt_per_day[i-1] = debt;
          }
          
          
          
      }  else {
          throw "Invalid interest type";
      }
  }
  // Return results as a record.
  return {x : day, y : debt_per_day, z: interest_accumulated_by_day};
}


// validateLoan: check if loan is valid - will be able to be repaid in specified time interval.
function validateLoan(loan) {
  return new Promise(function(resolve, reject) {
    if (new Date(loan.dateIssued) < new Date(loan.deadline) && loan.payment_interval > 0 && loan.payment_amount > 0 & loan.amount > 0 && loan.interest >= 0 && (loan.compoundInterest == true || loan.compoundInterest == false) && (loan.interest_on_debt == true || loan.interest_on_debt == false)) {
      usernameExists(loan.recipient).then(function(result) {
        if (result) {
          // Get debt values per day.
          var loan_stats = debtByTime(new Date(loan.dateIssued), new Date(loan.deadline), Number(loan.payment_interval), Number(loan.payment_amount), Number(loan.amount), Number(loan.interest), Boolean(loan.compoundInterest), Boolean(loan.interest_on_debt));
          // Get array of debt.
          var debt_by_day = loan_stats.y;
          // If no debt left on last day, contract is valid.
          if(debt_by_day[debt_by_day.length - 1] == 0) {
              resolve(true);
          } else {
              resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
}


// usernameExists: check if user with given username exists in database
var usernameExists = function(username) {
  return new Promise(function(resolve, reject) {
    // if username is set.
    if (username) {
    User
      .findById(username)
      .exec(function(error, user) {
        if (!user) {  // If user not found
          resolve(false);
        // if error while executing function
        } else if (error) {
          resolve(true);
        }
        // if success
        resolve(true);
      });
    // else if no parameters or if parameters do not include idUser
    } else {
      resolve(true);
    }
  });
};


// recipient in contacts: check if loan recipient is in user's contacts.
var recipientInContacts = function(username, contactUsername) {
  return new Promise(function(resolve, reject) {
    // if username is set.
    if (username) {
      User
      .findById(username)
      .exec(function(error, user) {
        if (!user) {  // If user not found
          resolve(false);
        // if error while executing function
        } else if (error) {
          resolve(false);
        }
        // if success, check if user has contactUsername in contacts.
        // Check if contact username exists.
        usernameExists(contactUsername).then(function(result) {
          // If username exists, find subdocuments by field contacts with given username.
          if (result) {
            User.find({
              "contacts": {
                  "$elemMatch": { "username": contactUsername }
              }
            }).exec(function(err, contacts){
              if (err) {
                resolve(false);
              // If contacts are not empty, resolve true.
              } else if (contacts) {
                resolve(true);
              } else {
                resolve(false);
              }
            });
          // If contact's username does not exist, resolve as false.
          } else {
            resolve(false);
          }
        });
      });
    // else if no parameters or if parameters do not include idUser
    } else {
      resolve(true);
    }
  });
};


// Get user's id (username) from JWT
var getLoggedId = function(request, response, callback) {
  // If request contains a payload and the payload contains a username
  if (request.payload && request.payload.username) {
    User
      .findById(
        request.payload.username
      )
      .exec(function(error, user) {
        if (!user) {     // If user not found
          getJsonResponse(response, 404, {
            "message": "User not found"
          });
          return;
        } else if (error) {   // if encountered error
          getJsonResponse(response, 500, error);
          return;
        }
        callback(request, response, user._id);
      });
  } else {    // Else if no payload or if payload does not contain field username
    getJsonResponse(response, 400, {
      "message": "Inadequate data in token"
    });
    return;
  }
};