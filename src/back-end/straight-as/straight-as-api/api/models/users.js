var mongoose = require("mongoose");
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


// Schema representing a todo list item
var todoItemShema = new mongoose.Schema({
  dueDate: {type: Date, "default": Date.now()},  // date the todo list item is due
  description: {type: String, required: true},  // description of the todo list item
  completed: {type: Boolean, "default": false, required: true}  // indicator whether this todo list item is completed
});


// Schema representing a user's todo list
var todoListSchema = new mongoose.Schema({
  items: [todoItemShema]
});


// Schema representing an administrator's administrative message
var administrativeMessageSchema = new mongoose.Schema({
  sentBy: {type: String, required: true},              // Message sender's username
  value: {type : String, required: true}               // Message's string value
});


// Schema representing an event on the calendar
var eventSchema = new mongoose.Schema({
  description: {type: String, required: true},           // event's description
  date: {type: Date, "default": Date.now()}              // date of the event
});


// Schema representing a user's calendar
var calendarShema = new mongoose.Schema({
  events: [eventSchema]                                 // Calendar has events.
});


// Schema representing a user's timetable
var timetableSchema = new mongoose.Schema({
  events: [eventSchema]                                 // Timetable has events
});


// Schema representing a user
var userSchema = new mongoose.Schema({                      
  _id: {type: String, required: true, unique: true},      // email - serves as user's id
  todoLists : [todoListSchema],                           // user's todo lists
  calendars : [calendarShema],                            // user's calendars
  timetables : [timetableSchema],                         // user's timetables
  status: {type: Number, "default": 0},                   // 0 ~ activated_no; 1 ~ activated_yes; 2 ~ terminated
  hashValue: String,                                      // password hash value
  randomValue: String,                                    // random value used in hashing
  validationCode: String,                                 // Validation code used for generating address for account validation
  admin : Boolean,                                        // Is the user an administrator
  eventAdmin: Boolean 									  // Is the user an event administrator
});


// setPassword: Set user's passowrd
userSchema.methods.setPassword = function(password) {
  this.randomValue = crypto.randomBytes(16).toString('hex');
  this.validationCode = crypto.randomBytes(16).toString('hex');
  this.hashValue = crypto.pbkdf2Sync(password, this.randomValue, 1000, 64, 'sha512').toString('hex');
};

// checkPassword: Check validity of password
userSchema.methods.checkPassword = function(password) {
  var hashValue = crypto.pbkdf2Sync(password, this.randomValue, 1000, 64, 'sha512').toString('hex');
  return this.hashValue == hashValue;
};

// generateJwt: generate Json Web Token
userSchema.methods.generateJwt = function() {
  var expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // Valid for seven days
  return jwt.sign({
    id: this._id,
    expirationDate: parseInt(expirationDate.getTime() / 1000, 10)
  }, process.env.JWT_PASSWORD);
};


// Compile the schema into a model.
// Name of model, schema to be used, optional name of the mongoDB collection
mongoose.model('User', userSchema, 'Users');
