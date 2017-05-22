// Module dependencies.
var application_root = __dirname,
  cloudinary = require('cloudinary'),
  combinatorics = require('js-combinatorics'),
  path = require('path'), //Utilities for dealing with file paths
  mongoose = require('mongoose'), //Used for accessing a MongoDB database
  express = require('express'), //Web framework
  unique = require("array-unique").immutable,
  admin = require("firebase-admin"),
  methodOverride = require("method-override"); 

//Setup mongoose to use nodejs built-in  promise library instead of its mpromise

mongoose.Promise = global.Promise;

// config file
var cfg = require('./config');


var sorters = require("./utilities/sorters")

var serviceAccount = require("./trysto-3de15-firebase-adminsdk-lktpn-9ebf370f97.json");
var registrationToken = ["dTUggsukKRg:APA91bEYAdNu7rT5UZzbA0MVmpXuCAyM3c4sBANme_SD_IqYBamr8OEibKnnpNc-tL4EioBvwoJpqR56fVTx04WRcB2SVfhQbFjSgYPQhYTad8sJCRo7Dar4-pMvRsogz1gXSNQSp8sr",
  "fWfnlv6nkSk:APA91bFW3-dUmbICYX4Td0kePOrzT5D73BtbQg4cKGSBk2Z8Y0Mn225uQ_el9j3KYXiBxxF7wlQ8TAdSCY9ku1GZrajRS7ECd4v3WXI2feRTmmCpPwegiB6qYxVFMvOsYwivDsh_VKey",
  "dpdPsVgpYpI:APA91bGQ7Y_GQTk3a0MRu5YSlvPbJe-R5qeNO41IMJWjcrCGjj-Wgujck_L7dMZRtjs0RFpAG0xHQ30X2P-q0G_lEeIu7IORrrhi6vkm8rRlIiGVKkOeurfdQC_NljwfD6eLYJ3NUJx3",
  "wQ3L-wHFHw:APA91bFMzixiTXbr-_fQfJlaihvygEGmw8i6OYHUwy5w1vP5LP2OnXtY0Pe-GE6aptf1Um3J6MY3UsTrQhJxWOfppepO4Ap3mJTmmDKDgz3PdYFVAq43Qm0y7pO5NmOvE1GeU_v9Vajz"
];
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trysto-3de15.firebaseio.com"
});

//Models & schema
var Book = require('./book');
var Friend = require('./friend');
var EventRegistration = require('./eventregistration');
var User = require('./user');
var Event = require('./event');

cloudinary.config({
  cloud_name: 'trystodating',
  api_key: '936889512183778',
  api_secret: 'fQO2dE2PPCmZjbRi1cE9UD14P6I'
});


//Create server
var app = express();

// sign with default (HMAC SHA256)
var jwt = require('express-jwt');
var tokenlib = require('jsonwebtoken');

// Configure server
app.configure(function() {

app.use(methodOverride('X-HTTP-Method-Override'));

  app.use(jwt({
    secret: 'SecretSecretSecret',
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(req) {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
      }
      else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
    }
  }).unless(['/api/v0/logon', '/api/v0/login/:phoneno', '/api/v0/forgotpassword/:phoneoremail', '/api/v0/usersignup']));


  app.use(function(err, req, res, next) {
    console.log("In mware")
      //console.log(req.headers.authorization)
    if (err.name === 'UnauthorizedError' && req.headers.authorization !== "") {
      res.status(401).send('invalid token...');
    }
    next();
  });


  

  // ## CORS middleware
  // 
  // see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,Content-Range');
    //res.header('X-Total-Count','1000');
    res.header('Access-Control-Expose-Headers', 'content-range');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send("[]");
    }
    else {
      next();
    }
  };
  app.use(allowCrossDomain);
  app.use(express.bodyParser());

  //perform route lookup based on url and HTTP method
  app.use(app.router);

  //Show all errors in development
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/docs');
});


var opts = {
  server: {
    user : "trystoapp",
    pass : "##$@qwer##$@",
    socketOptions: {
      keepAlive: 1
    }
  }
};

//Connect to database
mongoose.connect(cfg.dbconn, opts);

var usrMap = {},
usrMapInv = {},
evtMap = {},
evtMapInv = {}
//Connect provide numeric ids to users temporarily.
setInterval(function(){
  User.find({}).then(function(users){
 //users.forEach(function(usr){console.log(usr._id)})
  var count = 211;
   users.forEach(function(usr){
   //console.log(usr._id)
  count  = count + 1;
  usrMap[""+usr._id] = count;
  usrMapInv[""+count] = usr._id
  })
});

Event.find({}).then(function(events){
  var count = 421;
   events.forEach(function(evt){
  count  = count + 1;
  evtMap[""+evt._id] = count;
  evtMapInv[""+count] = evt._id
  })
});

},5000)

app.use('/', express.static(__dirname + '/docs/_build/html/'));

//Router
// basic route
app.get('/api', function(request, response) {
  response.send('The Trysto API is at http://' + host + ':' + port + '/api');
});

app.get('/events', (request, response) => {

  return Event.find(function(err, events) {
    if (!err) {
      if (events == null) return response.send(cfg.error);
      return response.render('event', {
        events: events
      });
    }
    else {
      console.log(err);
      return response.send(cfg.error);
    }
  });
});

var formidable = require('formidable'),
  http = require('http'),
  util = require('util'),
  fs = require('fs-extra');

app.post('/api/v0/upload', function(request, response) {

  var form = new formidable.IncomingForm()
  form.multiples = false
  form.keepExtensions = true
  form.uploadDir = __dirname
  console.log(form);
  form.parse(request, (err, fields, files) => {

    console.log(err)
    console.log(fields)
    console.log(files)


    if (err) return response.status(500).json({
      error: err
    })
    response.status(200).json({
      uploaded: true
    })
    console.log(files);
    cloudinary.uploader.upload(files[0], function(result) {
      console.log(result);
    })
  });
  //response.send("a")
});
//



app.get('/api/v0/logon', function(request, response) {
  // sign asynchronously 
  tokenlib.sign({
    dummy: 'dummypayload'
  }, "SecretSecretSecret", function(err, token) {
    //TODO: Handle error
    if (!err) {
      console.log(token);
      response.send(token);
    }
    response.send(cfg.error)
  });
  //  response.send()
});

app.get('/api/v0/signin', function(request, response) {
  response.send(jwt)
})



// usersignup with HTTP method POST, JSON payload
app.post('/api/v0/usersignup', function(request, response) {
  var user = new User({
    UserName: request.body.UserName,
    Email: request.body.Email,
    PhoneNumber: request.body.PhoneNumber,
    BirthDay: request.body.BirthDay,
    Gender: request.body.Gender,
    Password: request.body.Password,
    Education: request.body.Education,
    City: request.body.City,
    Work: request.body.Work,
    Interests: request.body.Interests,
    About: request.body.About,
    ProfilePic: request.body.ProfilePic,
    DeviceIdentifier: request.body.DeviceIdentifier,
    Status: request.body.Status
  });

  user.save(function(err) {
    console.log(err);
    if (!err) {
      console.log('created');
      return response.send(user);
    }
    else {
      console.log(err);
      return response.send(cfg.error);
    }
  });
  console.log(user);
  console.log(request.body.UserName);
});

app.put('/api/v0/userupdate', function(request, response) {
  return User.findOne({
    "Email": request.body.Email
  }, function(err, user) {
    if (!err) {
      if (user === null) return response.send(cfg.errorLoginFailed);
      user.UserName = request.body.UserName;
      //user.BirthDay = request.body.BirthDay;
      user.Education = request.body.Education;
      user.City = request.body.City;
      user.Work = request.body.Work;
      user.Interests = request.body.Interests;
      user.About = request.body.About;
      user.Status = request.body.Status;
      user.Hobbies = request.body.Hobbies;
      console.log(user);
      user.save(function(err) {
        console.log(err);
        if (!err) {
          console.log('created');
          return response.send(user);
        }
        else {
          console.log(err);
          return response.send(cfg.error);
        }
      });
      console.log(request.body.UserName);


    }
    else {
      console.log(err);
      return response.send(cfg.errorLoginFailed);
    }
  });

});




app.put('/api/v0/updateUDID', function(request, response) {
  return User.findOne({
    "Email": request.body.Email
  }, function(err, user) {
    if (!err) {
      if (user === null) return response.send(cfg.errorLoginFailed);

      user.DeviceIdentifier = request.body.DeviceIdentifier;

      console.log(user);
      user.save(function(err) {
        console.log(err);
        if (!err) {
          console.log('created');
          return response.send(user);
        }
        else {
          console.log(err);
          return response.send(cfg.error);
        }
      });
      console.log(request.body.DeviceIdentifier);


    }
    else {
      console.log(err);
      return response.send(cfg.errorLoginFailed);
    }
  });

});


/*app.get( '/api/v0/login/:id', function( request, response ) {
return User.findOne( { "PhoneNumber" : request.params.id }, function( err, user ) {
if( !err ) {
if(user == null) return response.send(cfg.error);
return response.send( user.Email );
} else {
console.log( err );
return response.send(cfg.error);
}
});
});*/


//Get a single user by telephone number and Password
// Returns Email id.

// TODO : integrate using OAuth2
app.post('/api/v0/login/:phoneno', function(request, response) {
  //console.log(request);
  return User.findOne({
    $or: [{
      $and: [{
        PhoneNumber: request.params.phoneno
      }, {
        Password: request.body.Password
      }]
    }, {
      $and: [{
        Email: request.params.phoneno
      }, {
        Password: request.body.Password
      }]
    }]

  }, function(err, user) {
    if (!err) {
      if (user === null) return response.send(cfg.errorLoginFailed);

      response.send(

        {

          _id: user._id,
          UserName: user.UserName,
          Email: user.Email,
          PhoneNumber: user.PhoneNumber,
          BirthDay: user.BirthDay,
          Gender: user.Gender,
          Education: user.Education,
          City: user.City,
          Hobbies: user.Hobbies,
          Work: user.Work,
          Interests: user.Interests,
          About: user.About,
          ProfilePic: user.ProfilePic
        }

      );
    }
    else {
      console.log(err);
      return response.send(cfg.errorLoginFailed);
    }
  });
});


app.get('/api/v0/login/:phoneno', function(request, response) {
  //console.log(request);
  return User.find({
    $or: [{
      PhoneNumber: request.params.phoneno
    }, {
      Email: request.params.phoneno
    }]

  }, function(err, user) {
    // console.log(user);
    if (!err) {
      if (user == null) return response.send(cfg.error);

      console.log(user)
      response.send(

        user.map(function(usr) {
          return {
            _id: usr._id,
            UserName: usr.UserName,
            Email: usr.Email,
            PhoneNumber: usr.PhoneNumber,
            BirthDay: usr.BirthDay,
            Gender: usr.Gender,
            Education: usr.Education,
            City: usr.City,
            Hobbies: usr.Hobbies,
            Work: usr.Work,
            Interests: usr.Interests,
            About: usr.About,
            ProfilePic: usr.ProfilePic
          }
        })
      );
    }
    else {
      console.log(err);
      return response.send(cfg.errorLoginFailed);
    }
  });
});

app.get('/api/v0/alluser/:id',function(request,response){
  if(request.params.id){
    var matchId = usrMapInv[request.params.id]
    console.log(matchId)
  User.aggregate([{
    "$match":{
      "_id": matchId
    }
    }, {
    "$project": {
      tmp: {
        "id": "$_id",
        "UserName": "$UserName",
        "Email": "$Email",
        "PhoneNumber": "$PhoneNumber",
        "Birthday": "$Birthday",
        "Gender": "$Gender",
        "City": "$City",
        "Education": "$Education",
        "Hobbies": "$Hobbies",
        "Interests": "$Interests",
        "Work": "$Work",
        "About": "$About",
        "ProfilePic": "$ProfilePic",
        "DeviceIdentifier": "$DeviceIdentifier",
        "Status": "$Status",
        "Facebook":"$Facebook",
        "Instagram" : "$Instagram",
        "Twitter" : "$Twitter"
      }
    }
  }, {
    "$group": {
      _id: null,
      count: {
        $sum: 1
      },
      rows: {
        $addToSet: '$tmp'
      }
    }
  }])
  .then(function(data){
  data[0].rows[0].id = usrMap[data[0].rows[0].id]
  return response.send({data: data[0].rows[0]});
  })
  .catch(function(e){
    response.send(cfg.error)
  })
  
  } else {
    response.send(cfg.error);
  }
})



app.get('/api/v0/alluser', function(request, response) {
  console.log(request.auth)

  //console.log(response);
  User.aggregate([{
    "$sort": {
      "UserName": 1
    }
  }, {
    "$project": {
      tmp: {
        "id": "$_id",
        "UserName": "$UserName",
        "Email": "$Email",
        "PhoneNumber": "$PhoneNumber",
        "Birthday": "$Birthday",
        "Gender": "$Gender",
        "City": "$City",
        "Education": "$Education",
        "Hobbies": "$Hobbies",
        "Interests": "$Interests",
        "Work": "$Work",
        "About": "$About",
        "ProfilePic": "$ProfilePic",
        "DeviceIdentifier": "$DeviceIdentifier",
        "Status": "$Status",
        "Facebook":"$Facebook",
        "Instagram" : "$Instagram",
        "Twitter" : "$Twitter"
      }
    }
  }, {
    "$group": {
      _id: null,
      count: {
        $sum: 1
      },
      rows: {
        $addToSet: '$tmp'
      }
    }
  }], function(err, users) {
    if (!err) {
      //console.log(users.length)
      response.header('Content-Range', 'users 0-' + users.length + '/' + users.length);
      var data = users[0].rows;
      if (request.param('sort')) {
        var sorts = request.param('sort').replace(/[\["\]]/g, '').trim(" ").split(",") || ['id', 'ASC']
        console.log("Sort By " + sorts[0])
        console.log("Sort AS " + sorts[1])
        var sortField = sorts[0]
        var sortBy = sorts[1]

        var count = 0;
        data.forEach(function(row) {
          row.id = usrMap[row.id]
        })
        data = data.sort(sorters.usrPropComparator(sortField, sortBy));
      }

      /*  var mkuser = function(usrName, email, gender, city, education, about) {
        count = count + 1;
        return {
          id: count,
          UserName: usrName || '',
          Email: email || '',
          Gender: gender || '',
          City: city || '',
          Education: education || '',
          About: about || '',
        }
      }
      var allUsers = []
      var count = 0
      users.forEach(function(usr) {
        allUsers.push(mkuser(usr['UserName'], usr['Email'], usr["Gender"], usr['City'], usr['Education'], usr['About']));
        count = count + 1;
      })

  */
      response.send({
        data: data
      });
    }
    else {
      console.log(err);
      return response.send(cfg.error);
    }
  });
});



// Forgot Password
app.get('/api/v0/forgotpassword/:phoneoremail', function(request, response) {
  //console.log(request);
  var outpass = "";
  User.find({
    $or: [{
      PhoneNumber: request.params.phoneoremail
    }, {
      Email: request.params.phoneoremail
    }]

  }, function(err, user) {
    //console.log(user);
    if (!err) {
      if (user == null) return response.send(cfg.error);
      outpass = user.map(function(usr) {
        return {
          _id: usr._id,
          UserName: usr.UserName,
          Email: usr.Email,
          PhoneNumber: usr.PhoneNumber,
          Password: usr.Password
        };

      });

      console.log("outpass");
      console.log(outpass);

      console.log("outpass1");
      console.log(outpass);
      var mailer = require("nodemailer");

      // Use Smtp Protocol to send Email
      var smtpTransport = mailer.createTransport({
        service: "Gmail",
        auth: {
          user: "trystodating@gmail.com",
          pass: "medici1234"
        }
      });

      var mail = {
        from: "Trysto Dating Inc <trystodating@gmail.com>",
        to: outpass[0].Email,
        subject: "Trysto Dating | Forgot password Email",
        txt: "Hi " + outpass[0].UserName + ",\n We intend to inform you that your password is the following : " + outpass[0].Password +
          "\n\nRegards & at your service,\nTrysto Team.",
        html: "Hi <i>" + outpass[0].UserName + "</i>,<br/><br/> we intend to inform you that your password is the following <br/> <b> " + outpass[0].Password +
          "</b><br/><br/>Regards & at your service,<br/>Trysto Team."
      }

      smtpTransport.sendMail(mail, function(error, response) {
        if (error) {
          console.log(error);
        }
        else {
          console.log("Message sent: " + response.message);
        }

        smtpTransport.close();
      });

      response.send(outpass);

    }
    else {
      console.log(err);
      return response.send(cfg.errorLoginFailed);
    }
  });


});
// Reset Password

// Block User


// Friend APIs

// get friendlist
app.get('/api/v0/friendlist/:phoneno', function(request, response) {
  var mutualFriend = [];
  return Friend.find(
      //{ UserPhoneId: request.params.phoneno }
      {
        $or: [{
          UserPhoneId: request.params.phoneno
        }, {
          FriendPhoneId: request.params.phoneno
        }]
      }
    )
    .populate('UserId')
    .exec(
      function(err, users) {
        //console.log(users);
        console.log(users.length);
        if (users.length == 0) return response.send(cfg.errorNoFriends);
        if (!err) {
          if (users === undefined) return response.send(cfg.errorPhoneNumberNotFound);
          if (users[0] === undefined) return response.send(cfg.errorPhoneNumberNotFound);

          //{ "Email" : users[0].UserId.Email, "ProfilePic" : users[0].UserId.ProfilePic }
          users.map(function(user) {
            console.log("user.UserId.PhoneNumber " + user.UserId.PhoneNumber + " -- user.FriendPhoneId " +
              user.FriendPhoneId + " --user.UserPhoneId " + user.UserPhoneId + " -- request.params.phoneno " + request.params.phoneno);

            //if((request.params.phoneno == user.UserPhoneId && request.params.phoneno == user.UserId.PhoneNumber && user.UserPhoneId == request.params.phoneno ) ){
            mutualFriend.push(user.FriendPhoneId);
            console.log("mutualFriend " + user.FriendPhoneId);
            //console.log(user);
            //}
          });
          console.log(mutualFriend);
          mutualFriend = unique(mutualFriend);
          console.log(mutualFriend);
          return response.send(
            users.map(function(usr) {
              console.log("inner " + usr.UserId.PhoneNumber + " " /*+ mutualFriend.indexOf(usr.UserPhoneId,0)*/ )

              if (mutualFriend.indexOf(usr.UserPhoneId, 0) > 0
                /*((request.params.phoneno == usr.UserPhoneId && request.params.phoneno == usr.UserId.PhoneNumber && usr.UserPhoneId == request.params.phoneno )
                            || (request.params.phoneno == usr.FriendPhoneId && usr.UserId.PhoneNumber == usr.UserPhoneId))*/
              )
                if (usr.FriendPhoneId !== usr.UserPhoneId) {

                  //console.log(user);
                  console.log("user.UserId.PhoneNumber " + usr.UserId.PhoneNumber + " -- user.FriendPhoneId " +
                    usr.FriendPhoneId + " --user.UserPhoneId " + usr.UserPhoneId + " -- request.params.phoneno " + request.params.phoneno);


                  return {
                    Email: usr.UserId.Email,
                    UserPhoneId: usr.UserPhoneId,
                    UserName: usr.UserId.UserName,
                    BirthDay: usr.UserId.BirthDay,
                    City: usr.UserId.City,
                    ProfilePic: usr.UserId.ProfilePic,
                    Gender: usr.UserId.Gender,
                    FriendPhoneId: usr.FriendPhoneId
                  }
                }
            }));
        }
        else {
          console.log('Some error' + err);
          return response.send(cfg.errorPhoneNumberNotFound);
        }
      });
});

// add as friend

app.post('/api/v0/addfriend', function(request, response) {
  User.find({
    $or: [{
      PhoneNumber: request.body.UserPhoneId
    }, {
      PhoneNumber: request.body.FriendPhoneId
    }]
  }, function(err, users) {
    //console.log("users"); console.log(users); console.log(users.length);
    if (err || users.length < 2) {
      response.send(cfg.errorPhoneNumberNotFound);
      response.status(501).end();
      return 0;
    }

    cfg.existsPhone = users.length;
    console.log('A .. ' + cfg.existsPhone + ' .. ' + cfg.alreadyFriend);
    if (cfg.existsPhone === 0 || cfg.existsPhone === undefined) {
      response.send(cfg.errorPhoneNumberNotFound);
      response.status(501).end();
      return 0;
    }
    cfg.userId = users[0];
    console.log('users' + ' - ' + users.length);
  });

  Friend.find({

    $or: [{
      $and: [{
        UserPhoneId: request.body.UserPhoneId
      }, {
        FriendPhoneId: request.body.FriendPhoneId
      }]
    }, {
      $and: [{
        UserPhoneId: request.body.FriendPhoneId
      }, {
        FriendPhoneId: request.body.UserPhoneId
      }]
    }]

  }, function(err, friends) {
    if (err) {
      response.send(cfg.errorPhoneNumberNotFound);
      response.status(501).end();
      return 0;
    }
    console.log("friends");
    console.log(friends);
    if (cfg.alreadyFriend == 0 || friends == undefined || friends == null) {
      cfg.alreadyFriend = 0;
    }
    else {
      cfg.alreadyFriend = friends.length;
    }
    console.log('B .. ' + cfg.existsPhone + ' .. ' + cfg.alreadyFriend);
    if (cfg.alreadyFriend > 1) {
      response.send(cfg.errorAlreadyFriends);
      response.status(501).end();
      return 0;
    }
    console.log('friends' + ' - ' + cfg.alreadyFriend);



    //console.log('=======================================================');
    console.log('C .. ' + cfg.existsPhone + ' .. ' + cfg.alreadyFriend + ' :: ' + cfg.userId._id);
    if (cfg.alreadyFriend !== -1 && cfg.alreadyFriend !== undefined && cfg.userId._id !== undefined && cfg.alreadyFriend == 0) {

      var friend = new Friend({
        UserPhoneId: request.body.UserPhoneId,
        UserId: cfg.userId._id,
        FriendPhoneId: request.body.FriendPhoneId,
        FriendOnDate: request.body.FriendOnDate,
        IsBlocked: request.body.IsBlocked,
        BlockedOn: request.body.BlockedOn,
        Comments: request.body.Comments
      });
  
      friend.save(function(err) {
        console.log('\nsave\n' + friend);
        console.log(err);
        cfg.alreadyFriend = 1;
        if (!err) {
          return response.send({
            id: friend._id,
            FriendPhone: friend.FriendPhoneId
          });
        }
        else {
          console.log(err);
          response.send(cfg.errorPhoneNumberNotFound);
          return response.status(501).end();
        }
      });
    }
    else {
      cfg.alreadyFriend = 0;
      cfg.existsPhone = 0;
      response.send(cfg.errorAlreadyFriends);
      return response.status(501).end();
    }




  });



});

// Event APIs


// usersignup with HTTP method POST, JSON payload
app.post('/api/v0/createevent', function(request, response) {
  var event = new Event({
    EventId: request.body.EventId,
    Name: request.body.Name,
    Display: request.body.Display,
    MaleCount: request.body.MaleCount,
    FemaleCount: request.body.FemaleCount,
    OtherCount: request.body.OtherCount,
    EventDate: request.body.EventDate,
    EventTime: request.body.EventTime,
    Duration: request.body.Duration,
    Image: request.body.Image,
    Status: request.body.Status
  });

  console.log(request.body.Display);
  console.log(event);
  event.save(function(err) {
    if (!err) {
      console.log('created');
      sendFCM(event);
      return response.send(event);
    }
    else {
      console.log(err);
      return response.send(cfg.error);
    }
  });
});

// event id
app.get('/api/v0/event/:id', function(request, response) {
  return Event.findOne({
    $and: [{
      "_id": request.params.id
    }, {
      Status: "Active"
    }]
  }, function(err, event) {
    if (!err) {
      if (event == null) return response.send(cfg.error);
      return response.send(event);
    }
    else {
      console.log(err);
      return response.send(cfg.error);
    }
  });
});


app.get('/api/v0/apievents/:id',function(request,response){
  if(request.params.id){
        var matchId = evtMapInv[request.params.id+'']
    console.log(matchId)
  Event.aggregate([{
    "$match": {
      "Status": "Active",
      "_id" : matchId
    }
  }, {
    "$project": {
      tmp: {
        "id": "$_id",
        "EventId": "$EventId",
        "Name": "$Name",
        "Display": "$Display",
        "MaleCount": "$MaleCount",
        "FemaleCount": "$FemaleCount",
        "OtherCount": "$OtherCount",
        "EventDate": "$EventDate",
        "EventTime": "$EventTime",
        "Duration": "$Duration",
        "Image": "$Image",
        "Status": "$Status"
      }
    }
  }, {
    "$group": {
      _id: null,
      count: {
        $sum: 1
      },
      rows: {
        $addToSet: '$tmp'
      }
    }
  }])
  .then(function(data){
    data.forEach(function(row) {
          row.id = evtMap[row.id]
        })
  return response.send({data: data[0].rows[0]});
  })
  .catch(function(e){
    console.log(e)
    response.send(cfg.error)
  })
  
  } else {
    response.send(cfg.error);
  }
})



app.get('/api/v0/apievents', function(request, response) {
  console.log("Order : " + request.param('order'));
  console.log("Range : " + request.param('range'));
  
  var AllEvents = Event.aggregate([{
    "$match": {
      "Status": "Active"
    }
  }, {
    "$sort": {
      "Name": 1
    }
  }, {
    "$project": {
      tmp: {
        "id": "$_id",
        "EventId": "$EventId",
        "Name": "$Name",
        "Display": "$Display",
        "MaleCount": "$MaleCount",
        "FemaleCount": "$FemaleCount",
        "OtherCount": "$OtherCount",
        "EventDate": "$EventDate",
        "EventTime": "$EventTime",
        "Duration": "$Duration",
        "Image": "$Image",
        "Status": "$Status"
      }
    }
  }, {
    "$group": {
      _id: null,
      count: {
        $sum: 1
      },
      rows: {
        $addToSet: '$tmp'
      }
    }
  }]);

  AllEvents.then(function(events) {
   // if (!err) {
      response.header('Content-Range', 'events 0-' + events[0].count + '/' + events[0].count);
      var data;
      data = events[0].rows;
      if (request.param('sort')) {
        //get field to sort
        var sorts = request.param('sort').replace(/[\["\]]/g, '').trim(" ").split(",") || ['id', 'ASC']
          //TODO Remove these
        console.log("Sort By " + sorts[0])
        console.log("Sort AS " + sorts[1])

        var sortField = sorts[0]
        var sortBy = sorts[1]
        data = data.sort(sorters.eventPropComparator(sortField, sortBy));
      }
      data.forEach(function(row) {
          row.id = evtMap[row.id]
        })
       response.send({data : data});

  }).catch(function(err){  response.send(cfg.error);});
});



app.get('/api/v0/landing', function(request, response) {
  var TopEvents = Event.aggregate([{
    $match: {
      "Status": "Active"
    }
  }, {
    $project: {
      id: "$_id",
      Name: "$Name",
      totalMems: {
        $sum: ["$ActualMaleCount", "$ActualFemaleCount", "$ActualOtherCount"]
      }
    }
  }, {
    $sort: {
      totalMems: -1
    }
  }, {
    $limit: 5
  }]);



  var Top5Users = EventRegistration.aggregate(
    [{
      $match: {
        "IsAttending": "1"
      }
    }, {

      $group: {
        _id: "$UserId",
        totalEventsRegistered: {
          $addToSet: "$EventId"
        }
      }
    }, {
      $project: {
        totalCnt: {
          $size: "$totalEventsRegistered"
        }
      }
    }, {
      $sort: {
        totalCnt: -1
      }
    }, {
      $limit: 5
    },
    {$lookup:
     {
       from: "users",
       localField: "_id",
       foreignField: "_id",
       as: "UserName"
     }
    }
])


  var allDone = Promise.all([TopEvents, Top5Users])
  allDone.then(function(a) {
    response.send({data: a})
  }).catch(function() {
    response.send(cfg.error);
  })
});




app.get("/api/v0/events", function(request, response) {
  //response.status(200).json({"msg":"events msg"});
  Event.find({
    Status: "Active"
  }, function(err, events) {
    if (err) {
      response.status(404).json({
        "error": "not found",
        "err": err
      });
      return;
    }
    response.jsonp(events);
  });
});

// Event Registration by user
// usersignup with HTTP method POST, JSON payload
app.post('/api/v0/joinevent', function(request, response) {
  var eventregistration = new EventRegistration({
    EventId: request.body.EventId,
    UserId: request.body.UserId,
    UserEmailId: request.body.UserEmailId,
    RegisteredOnDate: request.body.RegisteredOnDate,
    IsAttending: request.body.IsAttending,
    Comments: request.body.Comments
  });

  var count = 0;
  EventRegistration.count(

    {
      $and: [{
        "EventId": request.body.EventId
      }, {
        "UserId": request.body.UserId
      }]
    }

    ,
    function(err, eventsCount) {
      console.log(eventsCount);
      if (err) {
        response.status(404).json({
          "error": "not found",
          "err": err
        });
        return;
      }
      count = eventsCount;
      return count;
    });

  console.log(request.body.UserEmailId + " " + count);
  console.log(count);
  console.log(count.length);

  if (count === 0 || count.length === undefined) {
    eventregistration.save(function(err) {
      if (!err) {
        console.log('created');
        return response.send(eventregistration);
      }
      else {
        console.log(err);
        return response.send(cfg.error);
      }
    });
  }
  else {
    return response.send(eventregistration);
  }
});


app.get('/api/v0/allinevent', function(request, response) {
  console.log(request.params);
  return EventRegistration
    .find()
    .populate('EventId')
    .exec(function(err, events) {
      if (err) return response.send(err);
      EventRegistration.populate(events, {
          path: 'UserId',
          model: 'User'
        },
        function(err, attendees) {
          if (err) return response.send(err);
          //console.log(attendees);
          // This object should now be populated accordingly.
          response.send(attendees.map(function(attendee) {
            console.log("\n\n" + attendee);
            if (attendee.UserId !== undefined)
              return {
                EventId: attendee._id,
                UserEmailId: attendee.UserEmailId,
                UserPhoneId: attendee.UserId.PhoneNumber,
                RegisteredOnDate: attendee.RegisteredOnDate,
                IsAttending: attendee.IsAttending,
                Comments: attendee.Comments,
                UserName: attendee.UserId.UserName,
                UserBDay: attendee.UserId.BirthDay,
                UserCity: attendee.UserId.City,
                ProfilePic: attendee.UserId.ProfilePic
              }
          }));
        });
    });
});

app.get('/api/v0/whoallinevent/:eventid', function(request, response) {
  console.log(request.params);
  return EventRegistration
    .find({
      "EventId": request.params.eventid
    })
    .populate('EventId')
    .exec(function(err, events) {
      if (err) return response.send(err);
      EventRegistration.populate(events, {
          path: 'UserId',
          model: 'User'
        },
        function(err, attendees) {
          if (err) return response.send(err);
          //console.log(attendees);
          // This object should now be populated accordingly.
          response.send(attendees.map(function(attendee) {
            console.log("\n\n" + attendee);
            return {
              EventId: attendee._id,
              UserEmailId: attendee.UserEmailId,
              UserPhoneId: attendee.UserId.PhoneNumber,
              RegisteredOnDate: attendee.RegisteredOnDate,
              IsAttending: attendee.IsAttending,
              Comments: attendee.Comments,
              UserName: attendee.UserId.UserName,
              UserBDay: attendee.UserId.BirthDay,
              UserCity: attendee.UserId.City,
              ProfilePic: attendee.UserId.ProfilePic
            }
          }));
        });
    });
});

app.get('/api/v0/eventschedule', function(request, response) {
  return EventRegistration
    .find()
    .populate('EventId')
    .exec(function(err, events) {
      if (err) return response.send(err);
      EventRegistration.populate(events, {
          path: 'UserId',
          model: 'User'
        },
        function(err, attendees) {
          if (err) return response.send(err);

          var emailids = attendees.map(function(attendee) {
            if (attendee.UserEmailId !== '')
              return attendee.UserEmailId

          });
          emailids = emailids.filter(function(val) {
            if (val) return val
          }).join(',')
          emailids = emailids.split(',');
          //response.send(unique(emailids));
          var cmb = combinatorics.combination(
            unique(emailids), 2);
          var speedchat = [];
          while (a = cmb.next()) {
            speedchat.push(a);
          }
          response.send(speedchat);

        });
    });
});

function sendFCM(event) {
  console.log("sendEventCreation PN")
  console.log(event);
  var payload = {
    notification: {
      title: "ALERT!!! Event Reminder" + date,
      body: " Event details: " + event
    },
  };
  registrationToken.map(function(token) {
    sendToFCMToken(token, payload);
  });

}

function sendToFCMToken(token, payload) {
  admin.messaging().sendToDevice(token, payload)
    .then(function(response) {
      // See the MessagingDevicesResponse reference documentation for
      // the contents of response.
      console.log("Successfully sent message:", response.successCount);
    })
    .catch(function(error) {
      console.log("Error sending message:", error);
    });
}
//Start server
var port = cfg.port;
var server = app.listen(port, function() {
  console.log('Trysto API Express server listening on port %d in %s mode', port, app.settings.env);
});

server.timeout = 120000;
