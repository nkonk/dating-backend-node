//Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = mongoose.model('EventRegistration' , new Schema({
    EventId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    UserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    UserEmailId : String,
    RegisteredOnDate : String,
    IsAttending : String,
    Comments : String
})

);
