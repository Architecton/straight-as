const request = require("request");
const expect = require("chai").expect;
const baseUrl = "http://localhost:3000";

const admin_account = {
	'_id' : 'je.vivod@gmail.com',
	'admin' : true
};

const login_email = "je.vivod@gmail.com";
const login_password = "geselce";

var admin_jwt_token;
var id_todo_list;
var id_todo_list2;
var id_todo_list_item;
var dueDate_prev;

var timetable_id;
var created_table_id;
var created_event_Id;

var created_calendar_id;

// ########################### 1. AUTHENTICATION AND ADMINISTRATION TESTS ########################### 

describe('Log In', () => {
		describe('Logging in with existing account', () => {
				it('Upon logging in, user should receive JWT token.', (done) => {
						request({
								url : baseUrl + '/users/login',
								method : 'post',
								form : {
									email : login_email,
									password : login_password
								}
						}, function(error, response, body) {
							const bodyObj = JSON.parse(body);
							expect(response.statusCode).to.equal(200);
							expect(bodyObj).to.haveOwnProperty('token');
              admin_jwt_token = bodyObj.token;
							done();
						});
				});
		});
});

describe('administrator account', () => {
  describe('administrator account exists', () => {
    it('administrator account should have specified email', (done) => {
        request.get(
            {
              url: baseUrl + '/users',
              headers: {
                'Authorization' : 'Bearer ' + admin_jwt_token
              }
            },
            function(error, response, body) {
            	const bodyObj = JSON.parse(body);
              for (var i = 0; i < bodyObj.length; i++) {
                if (bodyObj[0]._id === 'je.vivod@gmail.com') {
                  done();
                  return
                }
				      }
				      done(new Error('Administrator account with "_id" equal to' + admin_account._id + ' not found.'));
            });
    });

    it('administrator account should have "admin" property set to "true"', (done) => {
        request.get(
            { 
              url: baseUrl + '/users',
              headers: {
                'Authorization' : 'Bearer ' + admin_jwt_token
              }
            },
            function(error, response, body) {
            	const bodyObj = JSON.parse(body);
				      for (var i = 0; i < bodyObj.length; i++) {
					      if (bodyObj[0]._id === admin_account._id && bodyObj[0].admin === admin_account.admin) {
                  done();
                  return
					      }
				      }
				      done(new Error('"admin" flag is not set for account with "_id" equal to ' + admin_account._id));
            });
      });
  });
});


// ##################################################################################################





// ########################### 2. todo lists ########################################################

describe('Working with Todo Lists', () => {
		describe('Adding Todo Lists', () => {
				it('There should be no todo lists initialy.', (done) => {
				request({
						url : baseUrl + '/todolists',
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
						method : 'get'
				  }, function(error, response, body) {
              const bodyObj = JSON.parse(body);
              expect(bodyObj.length).to.equal(0);
              done();
				    });
				});

				it('After adding a todo list there should be a single todo list.', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists',
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method: 'post',
          }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj).to.haveOwnProperty('items');
			      id_todo_list = bodyObj._id;
            request({
              url : baseUrl + '/todolists',
              headers : {
                'Authorization' : 'Bearer ' + admin_jwt_token
              },
              method : 'get'
            }, function(error, response, body) {
              const bodyObj = JSON.parse(body);
              expect(bodyObj.length).to.equal(1);
              done();
            })
          })
				});
		});
		describe('Getting information about specific todo list', () => {
				it('We should be able to get the todo list information by its id.', (done) => {
				  request({
					url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list,
					headers : {
					  'Authorization' : 'Bearer ' + admin_jwt_token
					},
					method : 'get'
				  }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj).to.haveOwnProperty('_id')
            expect(bodyObj).to.haveOwnProperty('items');
            done();
				  });
				});

				it('The todo list should contain no items.', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list,
            headers: {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method : 'get'
          }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj.items.length).to.equal(0);
            done();
          })	
				});
		});
		describe('Deleting Todo Lists', () => {
				it('The todo list should no longer be in the database after being deleted.', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list,
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method : 'delete'
          }, function(error, response, body) {
            expect(response.statusCode).to.equal(204);
            request({
              url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list,
              headers : {
                'Authorization' : 'Bearer ' + admin_jwt_token
              },
              method : 'get'
            }, function(error, response, body) {
              expect(response.statusCode).to.equal(404);
              done();
            });
          });
				});
		});
});




describe('Working with todo list items', () => {
		describe('Adding, reading, updating and deleting items from a todo list', () => {
				it('There should be no todo lists initialy.', (done) => {
          request({
            url : baseUrl + '/todolists',
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method: 'get'
          }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj.length).to.equal(0);
            done();
          });
				});

				it('There should be a single todo list after adding one.', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists',
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method: 'post'
          }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj).to.haveOwnProperty('_id');
            expect(bodyObj).to.haveOwnProperty('items');
            id_todo_list2 = bodyObj._id;
            request({
              url : baseUrl + '/todolists',
              headers : {
                'Authorization' : 'Bearer ' + admin_jwt_token
              },
              method : 'get'
            }, function(error, response, body) {
              const bodyObj = JSON.parse(body);
              expect(bodyObj.length).to.equal(1);
              done();
            });
          });
				});

				it('There should be no items on the created todo list initialy.', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2,
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method : 'get'
          }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj).to.haveOwnProperty('items');
            expect(bodyObj.items.length).to.equal(0);
            done();
          });

				});

				it('There should be a single item on the todo list after adding it.', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2,
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method : 'post',
            form : {
              'dueDate' : Date.now(),
              'description' : 'test'
            }
          }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj).to.haveOwnProperty('dueDate');
            expect(bodyObj).to.haveOwnProperty('_id');
            expect(bodyObj).to.haveOwnProperty('description');
            expect(bodyObj).to.haveOwnProperty('completed');
            request({
              url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2,
              headers : {
                'Authorization' : 'Bearer ' + admin_jwt_token
              },
              method : 'get'
            }, function(error, response, body) {
              const bodyObj = JSON.parse(body);
              expect(bodyObj).to.haveOwnProperty('items');
              expect(bodyObj.items.length).to.equal(1);
              const added_item = bodyObj.items[0];
              expect(added_item).to.haveOwnProperty('dueDate');
              dueDate_prev = added_item.dueDate;
              expect(added_item).to.haveOwnProperty('_id');
              expect(added_item).to.haveOwnProperty('description');
              expect(added_item).to.haveOwnProperty('completed');
              id_todo_list_item = added_item._id;
              done();
            });
          });
				});

				it('The initial value of the "completed" property of the item on the todo list should be "false".', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2 + '/' + id_todo_list_item,
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method : 'get'
          }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj).to.haveOwnProperty('completed');
            expect(bodyObj.completed).to.equal(false);
            done();
          });
				});

				it('The value of the "completed" property of the item on the todo list should be "true" after setting it.', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2 + '/' + id_todo_list_item + '/status',
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method : 'post',
            form : {
              'completed' : true
            }
          }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj).to.haveOwnProperty('completed');
            expect(bodyObj.completed).to.equal(true);
            request({
              url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2 + '/' + id_todo_list_item,
              headers : {
                'Authorization' : 'Bearer ' + admin_jwt_token
              },
              method : 'get'
            }, function(error, response, body) {
              const bodyObj = JSON.parse(body);
              expect(bodyObj).to.haveOwnProperty('completed');
              expect(bodyObj.completed).to.equal(true);
              done();
            });
          });

				});

				it('The description and due date of the todo item should change.', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2 + '/' + id_todo_list_item,
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method : 'put',
            form : {
              'description' : 'something different',
              'dueDate' : Date.now()
            }
          }, function(error, response, body) {
            const bodyObj = JSON.parse(body);
            expect(bodyObj).to.haveOwnProperty('description');
            expect(bodyObj).to.haveOwnProperty('dueDate');
            expect(bodyObj).to.haveOwnProperty('_id');
            expect(bodyObj.description).to.equal('something different');
            expect(bodyObj.dueDate).to.not.equal(dueDate_prev);
            request({
              url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2 + '/' + id_todo_list_item,
              headers : {
                'Authorization' : 'Bearer ' + admin_jwt_token
              },
              method : 'get'
            }, function(error, response, body) {
              const bodyObj = JSON.parse(body);
              expect(bodyObj).to.haveOwnProperty('description');
              expect(bodyObj).to.haveOwnProperty('dueDate');
              expect(bodyObj).to.haveOwnProperty('_id');
              expect(bodyObj.description).to.equal('something different');
              expect(bodyObj.dueDate).to.not.equal(dueDate_prev);
              done();
            });
          });

				});

				it('The todo item should no longer be in the database after deleting it.', (done) => {
          request({
            url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2 + '/' + id_todo_list_item,
            headers : {
              'Authorization' : 'Bearer ' + admin_jwt_token
            },
            method : 'delete'
          }, function(error, response, body) {
            expect(response.statusCode).to.equal(204);
            request({
              url : baseUrl + '/users/' + admin_account._id + '/todolists/' + id_todo_list2 + '/' + id_todo_list_item,
              headers : {
                'Authorization' : 'Bearer ' + admin_jwt_token
              },
              method: 'get'
            }, function(error, response, body) {
              expect(response.statusCode).to.equal(404);
              done();
            });
          });
				});
		});
});

// ##################################################################################################


// ### 3. TIMETABLES ###################################################################################

describe('CRUD operations on timetables', () => {
  describe('Users should be able to manage their timetables', () => {
    it('There should be no timetables initially', (done) => {
      request({
        url : baseUrl + '/timetables',
        headers : {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method : 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj.length).to.equal(0);
        done();
      });
    });

    it('User should be able to add a new timetable', (done) => {
      request({
        url : baseUrl + '/users/' + admin_account._id + '/timetables',
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method : 'post'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(201);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        expect(bodyObj).to.haveOwnProperty('events');
        done();
      });
    });

    it('There should be a single timetable in the database after adding it', (done) => {
      request({
        url : baseUrl + '/timetables',
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj.length).to.equal(1);
        done();
      });
    });

    it('User should be able to get their timetables from database', (done) => {
      request({
        url : baseUrl + '/users/' + admin_account._id + '/timetables',
        headers : {
          'Authorization' : 'Bearer ' + admin_jwt_token 
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj.length).to.equal(1);
        expect(bodyObj[0]).to.haveOwnProperty('events');
        expect(bodyObj[0]).to.haveOwnProperty('_id');
        timetable_id = bodyObj[0]._id
        done();
      });
    });

    it('User should be able to get specific timetable from database', (done) => {
      request({
        url : baseUrl + '/users/' + admin_account._id + '/timetables/' + timetable_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('events');
        done();
      });
    });

    it('User should be able to delete their timetable from the database', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/timetables/' + timetable_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'delete'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(204);
        done();
      });
    });

    it('There should be no more timetables in the database after deleting it', (done) => {
      request({
        url: baseUrl + '/timetables',
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj.length).to.equal(0);
        done();
      });
    });
  });


  describe('Users should be able to manage events on their timetables', () => {
    it('There should be a single timetable in the database after adding it', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/timetables',
        headers: {
          'Authorization': 'Bearer ' + admin_jwt_token
        },
        method: 'post'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(201);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        expect(bodyObj).to.haveOwnProperty('events');
        request({
          url: baseUrl + '/users/' + admin_account._id + '/timetables',
          headers: {
            'Authorization': 'Bearer ' + admin_jwt_token
          },
          method: 'get'
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          const bodyObj = JSON.parse(body);
          expect(bodyObj.length).to.equal(1);
          expect(bodyObj[0]).to.haveOwnProperty('_id');
          created_table_id = bodyObj[0]._id;
          expect(bodyObj[0]).to.haveOwnProperty('events');
          done();
        });
      })
    });

    it('There should be no events on the created timetable initially', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/timetables/' + created_table_id,
        headers: {
          'Authorization': 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('events');
        expect(bodyObj.events.length).to.equal(0);
        done();
      });
    });

    it('The user should be able to add an event to their timetable', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/timetables/' + created_table_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'post',
        form: {
          'description': 'test',
          'startDate': Date.now(),
          'endDate': Date.now() + 100000
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(201);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        created_event_Id = bodyObj._id;
        expect(bodyObj).to.haveOwnProperty('description');
        expect(bodyObj).to.haveOwnProperty('startDate');
        expect(bodyObj).to.haveOwnProperty('endDate');
        expect(bodyObj.description).to.equal('test');
        done();
      });

    });

    it('User should be able to modify the item on their timetable', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/timetables/' + created_table_id + '/' + created_event_Id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'put',
        form: {
          'description': 'Apollo',
          'startDate': Date.now(),
          'endDate' : Date.now() + 1000000
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        const id_returned = bodyObj._id;
        expect(bodyObj).to.haveOwnProperty('description');
        expect(bodyObj).to.haveOwnProperty('startDate');
        expect(bodyObj).to.haveOwnProperty('endDate');
        expect(bodyObj.description).to.equal('Apollo');
        request({
          url: baseUrl + '/users/' + admin_account._id + '/timetables/' + created_table_id + '/' + created_event_Id,
          headers: {
            'Authorization': 'Bearer ' + admin_jwt_token
          },
          method: 'get'
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200); 
          const bodyObj = JSON.parse(body);
          expect(bodyObj).to.haveOwnProperty('_id');
          expect(bodyObj._id).to.equal(id_returned);
          expect(bodyObj).to.haveOwnProperty('startDate');
          expect(bodyObj).to.haveOwnProperty('endDate');
          expect(bodyObj).to.haveOwnProperty('description');
          expect(bodyObj.description).to.equal('Apollo');
          done();
        });
      });

    });

    it('The user should be able to delete the item on their timetable.', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/timetables/' + created_table_id + '/' + created_event_Id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'delete'
      }, function(request, response, body) {
        expect(response.statusCode).to.equal(204);
        done();
      })
    });

    it('The deleted event should no longer be on the timetable on the timetabe.', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/timetables/' + created_table_id + '/' + created_event_Id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      })
    });
  });
});



// ##################################################################################################

// ### 4. CALENDARS  ################################################################################

describe('CRUD operations on calendars', () => {
  describe('Users should be able to manage their calendars', () => {
    it('There should be no calendars initially.', (done) => {
      request({
        url: baseUrl + '/calendars',
        headers: {
          'Authorization': 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj.length).to.equal(0);
        done();
      })
    });

    it('User should be able to add a calendar.', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars',
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'post'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(201);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        expect(bodyObj).to.haveOwnProperty('events');
        done();
      });
    });

    it('There should be a single calendar after adding it.', (done) => {
      request({
        url: baseUrl + '/calendars',
        headers : {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj.length).to.equal(1);
        expect(bodyObj[0]).to.haveOwnProperty('_id');
        created_calendar_id = bodyObj[0]._id;
        expect(bodyObj[0]).to.haveOwnProperty('events');
        done();
      });
    });

    it('Users should be able to access a list of all their calendars', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars',
        headers : {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method : 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj.length).to.equal(1);
        expect(bodyObj[0]).to.haveOwnProperty('_id');
        expect(bodyObj[0]).to.haveOwnProperty('events');
        done();
      });
    });

    it('Users should be able to acces a calendar by its id', (done) => {
      console.log('AMEEN ' + created_calendar_id);
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars/' + created_calendar_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        expect(bodyObj).to.haveOwnProperty('events');
        done();
      });
    });

    it('Users should be able to delete their calendars', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars/' + created_calendar_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'delete'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(204);
        done();
      })
    });

    it('There should be no calendars in the database after the deletion', (done) => {
      request({
        url: baseUrl + '/calendars',
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj.length).to.equal(0);
        done();
      });
    });
  });

  describe('CRUD operations on events on calendars', () => {
    it('There should be a single calendar in the database after adding it.', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars',
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'post'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(201);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        created_calendar_id = bodyObj._id;
        expect(bodyObj).to.haveOwnProperty('events');
        request({
          url: baseUrl + '/calendars',
          headers: {
            'Authorization' : 'Bearer ' + admin_jwt_token
          },
          method: 'get',
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          const bodyObj = JSON.parse(body);
          expect(bodyObj.length).to.equal(1);
          expect(bodyObj[0]).to.haveOwnProperty('_id');
          expect(bodyObj[0]._id).to.equal(created_calendar_id);
          expect(bodyObj[0]).to.haveOwnProperty('events');
	        done();
        });
      })
    });

    it('There should be no events on the created calendar initially', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars/' + created_calendar_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        expect(bodyObj).to.haveOwnProperty('events');
        expect(bodyObj.events.length).to.equal(0);
        done();
      });
    });

    it('Users should be able to add an event on their calendars', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars/' + created_calendar_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'post',
        form: {
          'description': 'test',
          'startDate': Date.now(),
          'endDate': Date.now() + 10000
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(201);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        created_event_id = bodyObj._id;
        expect(bodyObj).to.haveOwnProperty('description');
        expect(bodyObj).to.haveOwnProperty('startDate');
        expect(bodyObj).to.haveOwnProperty('endDate');
        done();
      });
    });

    it('User should be able to get all events from a specific calendar.', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars/' + created_calendar_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('events');
        expect(bodyObj.events.length).to.equal(1);
        expect(bodyObj.events[0]).to.haveOwnProperty('_id');
        expect(bodyObj.events[0]).to.haveOwnProperty('startDate');
        expect(bodyObj.events[0]).to.haveOwnProperty('endDate');
        expect(bodyObj.events[0]).to.haveOwnProperty('description');
        done();
      });
    });

    it('Users should be able to retrieve a specific events from their calendar.', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars/' + created_calendar_id + '/' + created_event_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        expect(bodyObj).to.haveOwnProperty('description');
        expect(bodyObj).to.haveOwnProperty('startDate');
        expect(bodyObj).to.haveOwnProperty('endDate');
        done();
      });
    });

    it('Users should be able to modify events on their calendars.', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars/' + created_calendar_id + '/' + created_event_id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method: 'put',
        form: {
          'description': 'Zeus',
          'startDate': Date.now(),
          'endDate': Date.now() + 10000
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        expect(bodyObj).to.haveOwnProperty('startDate');
        expect(bodyObj).to.haveOwnProperty('endDate');
        expect(bodyObj).to.haveOwnProperty('description');
        done();
      });
    });

    it('Users should be able to delete events from their calendars.', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars/' + created_calendar_id + '/' + created_event_id,
        headers: {
          'Authorization': 'Bearer ' + admin_jwt_token
        },
        method: 'delete'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(204);
        done();
      });
    });

    it('There should be no events on the calendar after the deletion.', (done) => {
      request({
        url: baseUrl + '/users/' + admin_account._id + '/calendars/' + created_calendar_id,
        headers: {
          'Authorization': 'Bearer ' + admin_jwt_token
        },
        method: 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('events')
        expect(bodyObj.events.length).to.equal(0);
        done();
      });
    });
  });
});


// ### 5. USERS #####################################################################################

describe('Information about users', () => {
	describe('Users should be able to see information about their account and should be able to delete their accounts.', () => {
		it('Administrator should be able to access information about all accounts.', (done) => {
      request({
        url : baseUrl + '/users',
        headers : {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method : 'get'
      }, function(error, response, body) {
          const bodyObj = JSON.parse(body);
          expect(bodyObj).to.haveOwnProperty('length');
          expect(bodyObj.length).to.equal(1);
          expect(bodyObj[0]).to.haveOwnProperty('_id');
          done();
      });
		});

		it('User should be able to see information about their account.', (done) => {
      request({
        url : baseUrl + '/users/' + admin_account._id,
        headers: {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method : 'get'
      }, function(error, response, body) {
        const bodyObj = JSON.parse(body);
        expect(bodyObj).to.haveOwnProperty('_id');
        expect(bodyObj._id).to.equal(admin_account._id);
        done();
      });
		});

		it('User should be able to delete their account.', (done) => {
      request({
        url : baseUrl + '/users/' + admin_account._id,
        headers : {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method : 'delete'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(204);
        done();
      });
		});
	});
});

// ##################################################################################################

/*
describe('Database Management', () => {
  it('The database should be empty after nuking it.', (done) => {
    request({
      url : baseUrl + '/nukeDB',
      headers : {
        'Authorization' : 'Bearer ' + admin_jwt_token
      },
      method : 'delete'
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(204);
      request({
        url : baseUrl + '/users',
        headers : {
          'Authorization' : 'Bearer ' + admin_jwt_token
        },
        method : 'get'
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    });
  });
});
*/
