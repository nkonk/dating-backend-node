//Schema
var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;


module.exports = mongoose.model('User' , new Schema({
    TableName : String,
    UserName : String,
    Email : { type: String, required: true, unique: true },
    PhoneNumber : { type: String, required: true, unique: true },
    BirthDay : String,
    Gender : String,
    Password : String,
    Education: String,
    City : String,
    Work : String,
    Interests : String,
    About : String,
    ProfilePic : String,
    Active : String,
    InfractionCount : String,
    InfractionReason : String
}));
