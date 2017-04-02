//Schema
var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;


module.exports = mongoose.model('User' , new Schema({
    UserName : String,
    Email : { type: String, required: true, unique: true },
    PhoneNumber : { type: String, required: true, unique: true },
    Password : String,
    BirthDay : String,
    Gender : String,
    Education: String,
    City : String,
    Work : String,
    Interests : String,
    About : String,
    ProfilePic : String,
    Status : String,
    isFacebook : String,
    FacebookId : String,
    FacebookDisplayName : String,
    isGooglePlus: String,
    GoogleId : String,
    GoogleDisplayName : String,
    GoogleEmailId : String
}));
