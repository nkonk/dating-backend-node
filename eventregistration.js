//Schema
var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;


module.exports = mongoose.model('EventRegistration' , new Schema({
    EventId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    UserEmailId : String,
    RegisteredOnDate : String,
    IsAttending : String,
    Comments : String
}));
