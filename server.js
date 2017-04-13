// Module dependencies.
var application_root = __dirname,
    path = require( 'path' ),           //Utilities for dealing with file paths
    mongoose = require( 'mongoose' ),   //Used for accessing a MongoDB database
    express = require( 'express' );     //Web framework

// config file
var cfg = require('./config');


//Models & schema
var Book = require('./book');
var Friend = require('./friend');
var EventRegistration = require('./eventregistration');
var User = require('./user');
var Event = require('./event');



//Create server
var app = express();

// Configure server
app.configure( function() {
    //parses request body and populates request.body
    app.use( express.bodyParser() );

    //checks request.body for HTTP method overrides
    app.use( express.methodOverride() );

    //perform route lookup based on url and HTTP method
    app.use( app.router );

    //Show all errors in development
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
});


var opts = {
        server: {
        socketOptions: {keepAlive: 1}
    }
};

//Connect to database
mongoose.connect( cfg.dbconn,opts );
//var Schema = mongoose.Schema;
/*app.all('*', function(request, respose, next) {
    setTimeout(function() {
        console.log('timeout, slowness');
        next();
    }, 1200000); // 120 seconds
});
*/

app.use('/', express.static(__dirname + '/docs/_build/html/'));

//Router
// basic route
app.get('/api', function(request, response) {
    response.send('The Trysto API is at http://'+host+':' + port + '/api');
});

// usersignup with HTTP method POST, JSON payload
app.post('/api/v0/usersignup', function( request , response) {
    var user = new User( {
      UserName : request.body.UserName,
      Email : request.body.Email,
      PhoneNumber : request.body.PhoneNumber,
      BirthDay : request.body.BirthDay,
      Gender : request.body.Gender,
      Password : request.body.Password,
      Education: request.body.Education,
      City : request.body.City,
      Work : request.body.Work,
      Interests : request.body.Interests,
      About : request.body.About,
      ProfilePic : request.body.ProfilePic,
      Status : request.body.Status

    } );

    user.save( function( err ) {
        console.log(err);
        if( !err ) {
            console.log( 'created' );
            return response.send( user );
        } else {
            console.log( err );
            return response.send(cfg.error);
        }
    });
    console.log(user);
    console.log(request.body.UserName);
}
);

app.put('/api/v0/userupdate', function( request , response) {
  return User.findOne( { "Email" : request.body.Email }, function( err, user ) {
      if( !err ) {
          if(user === null) return response.send(cfg.errorLoginFailed);

      user.Education =request.body.Education;
      user.City = request.body.City;
      user.Work = request.body.Work;
      user.Interests = request.body.Interests;
      user.About = request.body.About;
      user.Status = request.body.Status;
      user.Hobbies = request.body.Hobbies;
      console.log(user);
      user.save(function( err ) {
         console.log(err);
         if( !err ) {
             console.log( 'created' );
             return response.send( user );
         } else {
             console.log( err );
             return response.send(cfg.error);
         }
      });
      console.log(request.body.UserName);


      } else {
          console.log( err );
          return response.send(cfg.errorLoginFailed);
      }
  });

}
);

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
app.post( '/api/v0/login/:phoneno', function( request, response ) {
//console.log(request);
    return User.findOne( { "PhoneNumber" : request.params.phoneno, "Password" : request.body.Password  }, function( err, user ) {
        if( !err ) {
            if(user == null) return response.send(cfg.errorLoginFailed);
            return response.send( { "Email" : user.Email, "ProfilePic" : user.ProfilePic } );
        } else {
            console.log( err );
            return response.send(cfg.errorLoginFailed);
        }
    });
});


app.get( '/api/v0/login/:phoneno', function( request, response ) {
//console.log(request);
    return User.find( { "PhoneNumber" : request.params.phoneno  }, function( err, user ) {
        if( !err ) {
            if(user == null) return response.send(cfg.error);
            return response.send(

              user.map(function(usr) {
                return {

                  UserName : usr.UserName,
                  Email : usr.Email,
                  BirthDay : usr.BirthDay,
                  Gender : usr.Gender,
                  Education: usr.Education,
                  City : usr.City,
                  Work : usr.Work,
                  Interests : usr.Interests,
                  About : usr.About,
                  ProfilePic : usr.ProfilePic
                }
              })
             );
        } else {
            console.log( err );
            return response.send(cfg.errorLoginFailed);
        }
    });
});

app.get( '/api/v0/alluser', function( request, response ) {
    return User.find(function( err, users ) {
        if( !err ) {
            return response.send( users );
        } else {
            console.log( err );
            return response.send(cfg.error);
        }
    });
});


// Forgot Password

// Reset Password

// Block User


// Friend APIs

// get friendlist
app.get('/api/v0/friendlist/:phoneno', function(request, response) {
  return Friend.find(
    //{ UserPhoneId: request.params.phoneno }
    {$or: [ { UserPhoneId: request.params.phoneno }, { FriendPhoneId: request.params.phoneno } ]}
  )
  .populate('UserId')
  .exec(
  function( err, users ) {
    console.log(users);
      if( !err ) {
          if(users === null) return response.send(cfg.errorPhoneNumberNotFound);
          if(users[0] === undefined) return response.send(cfg.errorPhoneNumberNotFound);
          if(users[0].UserId.PhoneNumber !== request.params.phoneno) {
             return response.send( { "Email" : users[0].UserId.Email, "ProfilePic" : users[0].UserId.ProfilePic } );
          }
          else {
             return response.send(cfg.errorPhoneNumberNotFound);
          }
      } else {
          console.log( err );
          return response.send(cfg.errorPhoneNumberNotFound);
      }
  });

});

// add as friend

app.post('/api/v0/addfriend', function(request, response) {
  User.find({ $or: [ { PhoneNumber: request.body.UserPhoneId }, { PhoneNumber: request.body.FriendPhoneId } ] },function(err, users) {
      if (err) {
          response.send(cfg.errorPhoneNumberNotFound);
          response.status(501).end();
          return 0;
      }

      cfg.existsPhone = users.length;
      console.log( 'A .. ' + cfg.existsPhone + ' .. ' + cfg.alreadyFriend);
      if(cfg.existsPhone === 0) {
        response.send(cfg.errorPhoneNumberNotFound);
        response.status(501).end();
        return 0;
      }
      cfg.userId = users[1];
      console.log('users'  + ' - ' + users.length + ' = ' + cfg.userId);
  });

  Friend.findOne({

          $and: [
                    { $or: [{UserPhoneId: request.body.UserPhoneId}, {FriendPhoneId: request.body.FriendPhoneId}] },
                    { $or: [{UserPhoneId: request.body.FriendPhoneId}, {FriendPhoneId: request.body.UserPhoneId}] }
                ]

        },function(err, friends) {
      if (err) {
          response.send(cfg.errorPhoneNumberNotFound);
          response.status(501).end();
          return 0;
      }

      if (friends === null) {cfg.alreadyFriend = 0; } else {cfg.alreadyFriend = friends.length;}
      console.log( 'B .. ' + cfg.existsPhone + ' .. ' + cfg.alreadyFriend);
      if(cfg.alreadyFriend === undefined) {
        response.send(cfg.errorAlreadyFriends);
        response.status(501).end();
        return 0;
      }
      console.log('friends'  + ' - ' + cfg.alreadyFriend);
  });


  //console.log('=======================================================');
  //console.log( 'C .. ' + cfg.existsPhone + ' .. ' + cfg.alreadyFriend + ' :: ' + cfg.userId._id);
  if(cfg.alreadyFriend !== -1 && cfg.alreadyFriend !== undefined ) {

    var friend = new Friend( {
      UserPhoneId : request.body.UserPhoneId,
      UserId : cfg.userId._id,
      FriendPhoneId : request.body.FriendPhoneId,
      FriendOnDate : request.body.FriendOnDate,
      IsBlocked : request.body.IsBlocked,
      BlockedOn : request.body.BlockedOn,
      Comments : request.body.Comments
    } );
    //console.log('=====\n');
    //console.log(friend);
    //console.log( 'D  ' + cfg.existsPhone + ' .. ' + cfg.alreadyFriend);

    friend.save( function( err ) {
        console.log('\nsave\n' + friend);
        console.log(err);
        cfg.alreadyFriend = -1;
        if( !err) {
            return response.send( {id: friend._id, FriendPhone: friend.FriendPhoneId } );
        } else {
            console.log( err );
            response.send(cfg.errorPhoneNumberNotFound);
            return response.status(501).end();
        }
    });
  }
  else {
    cfg.alreadyFriend = 0;
    cfg.existsPhone = 0;
    response.send(cfg.error);
    return response.status(501).end();
  }

});

// Event APIs


// usersignup with HTTP method POST, JSON payload
app.post('/api/v0/createevent', function( request , response) {
    var event = new Event( {
      EventId : request.body.EventId,
      Name : request.body.Name,
      Display : request.body.Display,
      MaleCount : request.body.MaleCount,
      FemaleCount : request.body.FemaleCount,
      OtherCount : request.body.OtherCount,
      EventDate : request.body.EventDate,
      EventTime : request.body.EventTime,
      Duration : request.body.Duration,
      Image : request.body.Image,
      Status : request.body.Status
    } );

    console.log(request.body.Display);
    console.log(event);
    event.save( function( err ) {
        if( !err ) {
            console.log( 'created' );
            return response.send( event );
        } else {
            console.log( err );
            return response.send(cfg.error);
        }
    });
}
);

// event id
app.get( '/api/v0/event/:id', function( request, response ) {
    return Event.findOne( { "_id" : request.params.id }, function( err, event ) {
        if( !err ) {
            if(event == null) return response.send(cfg.error);
            return response.send( event );
        } else {
            console.log( err );
            return response.send(cfg.error);
        }
    });
});

// event id
app.get( '/api/v0/event', function( request, response ) {
   //console.log(request);
   //console.log(response);
    return Event.find( function( err, events ) {
        if( !err ) {
            if(events == null) return response.send(cfg.error);
            return response.send( events );
        } else {
            console.log( err );
            return response.send(cfg.error);
        }
    });
});


app.get("/api/v0/events", function(request, response) {
    //response.status(200).json({"msg":"events msg"});
    Event.find({}, function(err, events) {
        if (err) {
            response.status(404).json({"error":"not found","err":err});
            return;
        }
        response.jsonp(events);
    });
});

// Event Registration by user
// usersignup with HTTP method POST, JSON payload
app.post('/api/v0/joinevent', function( request , response) {
    var eventregistration = new EventRegistration( {
      EventId : request.body.EventId,
      UserId : request.body.UserId,
      UserEmailId : request.body.UserEmailId,
      RegisteredOnDate : request.body.RegisteredOnDate,
      IsAttending : request.body.IsAttending,
      Comments : request.body.Comments
    } );

    console.log(request.body.UserEmailId);
    eventregistration.save( function( err ) {
        if( !err ) {
            console.log( 'created' );
            return response.send( eventregistration );
        } else {
            console.log( err );
            return response.send(cfg.error);
        }
    });
}
);


app.get('/api/v0/whoallinevent/:eventid', function( request , response) {
  console.log(request.params);
  return EventRegistration
   .find(
     { "EventId" : request.params.eventid }
   )
   .populate('EventId')
   .exec(function(err, events) {
     if(err) return response.send(err);
     EventRegistration.populate(events, {
       path: 'UserId',
       model: 'User'
     },
     function(err, attendees) {
       if(err) return response.send(err);
       //console.log(cars);
       // This object should now be populated accordingly.
       response.send(attendees.map(function(attendee) {
         return {
           EventId : attendee._id,
           UserEmailId : attendee.UserEmailId,
           RegisteredOnDate : attendee.RegisteredOnDate,
           IsAttending : attendee.IsAttending,
           Comments : attendee.Comments,
           UserName : attendee.UserId.UserName,
           UserBDay : attendee.UserId.BirthDay,
           UserCity : attendee.UserId.City
         }
       }));
     });
   });
}
);

//Start server
var port = cfg.port;
var server = app.listen( port, function() {
    console.log( 'Trysto API Express server listening on port %d in %s mode', port, app.settings.env );
});

server.timeout = 120000;
