
module.exports = {
 dbconn : 'mongodb://50.63.161.150/SpeedDating',
 /*dbconn :'mongodb://ec2-103-4-9-102.ap-northeast-1.compute.amazonaws.com/SpeedDating',*/
  port : 8081,
 host : "0.0.0.0",
 alreadyFriend : 0,
 existsPhone : 0,
 userId : "",
 error : {"ErrorCode": "1000", "ErrorMessage" : "General Error, please check logs"},
 errorLoginFailed : {"ErrorCode": "1001", "ErrorMessage" : "Login failed"},
 errorPasswordExpired : {"ErrorCode": "1002", "ErrorMessage" : "Password expired"},
 errorIncorrectCredentials : {"ErrorCode": "1003", "ErrorMessage" : "Incorrect Mobile number / password"},
 errorPhoneNumberNotFound : {"ErrorCode": "1004", "ErrorMessage" : "Incorrect Mobile numbers"},
 errorAlreadyFriends : {"ErrorCode": "1005", "ErrorMessage" : "Already added to Friend List"},
 errorNoFriends : {"ErrorCode": "1006", "ErrorMessage" : "No friends as of now. Join  Events and meet new friends"}
 }
