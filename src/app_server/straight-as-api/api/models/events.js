var mongoose = require("mongoose");

// Schema representing an event
var eventSchema = new mongoose.Schema({     
  date: {type: String, default: Date.now},
  title: {type: String},
  description: {type: String},
});


// Compile the schema into a model.
// Name of model, schema to be used, optional name of the mongoDB collection
mongoose.model('Event', eventSchema, 'Events');
