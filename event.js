//Schema
var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

 module.exports = mongoose.model('Event' , new Schema({
    Id : { type: String, required: true, unique: true },
    Name : String,
    Display : String,
    MaleCount : String,
    FemaleCount : String,
    OtherCount : String,
    EventDate : String,
    EventTime : String,
    Duration : String,
    Image : String,
    Status : String
}));
