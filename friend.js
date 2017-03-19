//Schema
var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;


module.exports = mongoose.model('Friend' , new Schema({
    UserPhoneId : String,
    UserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    FriendPhoneId : String,
    FriendOnDate : String,
    IsBlocked : String,
    BlockedOn : String,
    Comments : String
}));
