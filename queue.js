var Agenda = require('agenda');
var mongoose = require( 'mongoose' );
var admin = require("firebase-admin");
var combinatorics = require('js-combinatorics');
var path = require( 'path' );           //Utilities for dealing with file paths

var mongoAgendaConnectionString = "mongodb://127.0.0.1/agenda";
var mongoSpeedDatingConnectionString = "mongodb://127.0.0.1/SpeedDating";
//mongoAgendaConnectionString = "mongodb://50.63.161.150/agenda";
//mongoSpeedDatingConnectionString = "mongodb://50.63.161.150/SpeedDating";

var EventRegistration = require('./eventregistration');
var User = require('./user');
var Event = require('./event');
// config file
var cfg = require('./config');

var serviceAccount = require("./trysto-3de15-firebase-adminsdk-lktpn-9ebf370f97.json");
var registrationToken = [ "dTUggsukKRg:APA91bEYAdNu7rT5UZzbA0MVmpXuCAyM3c4sBANme_SD_IqYBamr8OEibKnnpNc-tL4EioBvwoJpqR56fVTx04WRcB2SVfhQbFjSgYPQhYTad8sJCRo7Dar4-pMvRsogz1gXSNQSp8sr",
"fWfnlv6nkSk:APA91bFW3-dUmbICYX4Td0kePOrzT5D73BtbQg4cKGSBk2Z8Y0Mn225uQ_el9j3KYXiBxxF7wlQ8TAdSCY9ku1GZrajRS7ECd4v3WXI2feRTmmCpPwegiB6qYxVFMvOsYwivDsh_VKey",
"dpdPsVgpYpI:APA91bGQ7Y_GQTk3a0MRu5YSlvPbJe-R5qeNO41IMJWjcrCGjj-Wgujck_L7dMZRtjs0RFpAG0xHQ30X2P-q0G_lEeIu7IORrrhi6vkm8rRlIiGVKkOeurfdQC_NljwfD6eLYJ3NUJx3",
"wQ3L-wHFHw:APA91bFMzixiTXbr-_fQfJlaihvygEGmw8i6OYHUwy5w1vP5LP2OnXtY0Pe-GE6aptf1Um3J6MY3UsTrQhJxWOfppepO4Ap3mJTmmDKDgz3PdYFVAq43Qm0y7pO5NmOvE1GeU_v9Vajz"];
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trysto-3de15.firebaseio.com"
});

var agenda = new Agenda({db: {address: mongoAgendaConnectionString}});

// or override the default collection name:
// var agenda = new Agenda({db: {address: mongoConnectionString, collection: "jobCollectionName"}});

// or pass additional connection options:
// var agenda = new Agenda({db: {address: mongoConnectionString, collection: "jobCollectionName", options: {server:{auto_reconnect:true}}}});

// or pass in an existing mongodb-native MongoClient instance
// var agenda = new Agenda({mongo: myMongoClient});
var db = undefined;
var evtList = [];
var agendaList = [];
var tokenMap = {};

agenda.define('Cleanup', function(job,done) {
  blockList =['Cleanup','ReadJobs','Events']
  agenda.jobs({}, function(err, jobs) {
    jobs.map(function(jb) {
      //log(jb);
      log('removed old job' + jb.attrs.name + " .." +jb.attrs.nextRunAt + ";;  " + blockList.indexOf(jb.attrs.name,0));
      //if(jb.attrs.name !== 'Cleanup')
      if(jb.attrs.data !== null) {
        //jb.save();
        log(jb.attrs.name + jb.attrs.data);
        jb.remove();

      }
      else {
        log("jb.attrs.data" + jb.attrs.data);
        var l = new Date(jb.attrs.nextRunAt).valueOf() - new Date().valueOf();
        var m = l / 86400;
        log(l);
        log(m);
        log(m/1000);
        //log(Date(jb.attrs.nextRunAt) + " " + Date())
        if(blockList.indexOf(jb.attrs.name,0) <0)
        jb.remove();
      }

    })
  });

});


//agenda.start();

agenda.define('ReadJobs', function(job, done) {
  agenda.jobs({}, function(err, jobs) {
    // Work with jobs (see below)
    jobs.map(function(job) {
      var l = new Date(job.attrs.nextRunAt).valueOf() - new Date().valueOf();
      var m = l / 86400;

      if( l /1000 > 360) job.remove();

      if(job.attrs.name == 'Events') {
        log('events refreshed');
        job.touch();
      }
      //else
      //job.run();
      /*job.touch(function() {
      log('job refreshed ' + job.attrs.name);
      //log(job.attrs);

    })
    job.save();
    */
  })
});
});

agenda.define('Events', function(job, done) {
  log('\n\nLook up for Events periodically');
  if(db !== undefined) {
    log("disconnect db");
    db.close();
    mongoose.disconnect();
    db = undefined;
  }
  else {
    log("connect db");
    var opts = {
      server: {
        socketOptions: {keepAlive: 1}
      }
    };
    mongoose.connect(mongoSpeedDatingConnectionString, opts);
    db = mongoose.connection;
  }
  //job.touch(function() { log('unlocked') });
  if(db !== undefined) {
    db.on("error", console.error.bind(console, "connection error"));
    //db.on("close", console.error.bind(console, "connection closed"));
    db.once("open", function(callback) {
      //log("Connection succeeded.");
      var cutoff = new Date(); log(cutoff);
      var eventList = [];
      var speedchat = [];
      var eventIds = [];
      Event.find( {/*EventDate: {$gt: cutoff}*/}, function( err, events ) {
        if( !err ) {
          if(events == null)  log(cfg.error);
          eventList = events.map(function(event) {

            var dateArray = event.EventDate.split('/');
            var eDate = new Date(dateArray[2],parseInt(dateArray[1])-1,parseInt(dateArray[0])+1)
            eDate =  (event.EventDate + " " + event.EventTime).toDate("dd/mm/yyyy hh:ii:ss");
            //log(eDate); log(cutoff);
            if(eDate.valueOf() > cutoff.valueOf()) { // "22/03/2016 14:03:01".toDate("dd/mm/yyyy hh:ii:ss");
            //log(event);
            //log("\n" + (event.EventDate + " " +event.EventTime) +  "\t " + event._id + "\n");
            log(event._id + "||" + event.Name + "::" + event.EventDate + " " + event.EventTime);
            return event._id + "||" + event.Name + "::" + event.EventDate + " " + event.EventTime;
          }

        });
        eventList = eventList.filter(function(val){if(val !== undefined)return val}).join(',');
        eventList = eventList.split(',');
        evtList = eventList;
        //log(evtList);
        eventIds = eventList.map(function(evt) {
          log(evt);
          var evtId = evt.split("||");
          var evtS = evtId[1].split('::');
          //log(evtId);
          //log(evtS);
          return evtId[0];

        });
        //callbackAgenda('*/1 * * * *', 'instant');

      } else {
        log( err );
        log(cfg.error);
      }
    });
    log("EvendIds"); log(eventIds);
    //done();
    var curatedCallList = [];
    EventRegistration
    .find(
    )
    .populate('EventId')
    .exec(function(err, events) {
      if(err) return log(err);
      EventRegistration.populate(events, {
        path: 'UserId',
        model: 'User'
      },
      function(err, attendees) {
        if(err) return log(err);

        var emailids = attendees.map(function(attendee) {

          if(attendee.UserEmailId !== '' && attendee.EventId !== null && eventIds.indexOf(attendee.EventId.id,0) > -1) {
            //log(attendee.EventId.Name +"::"+ attendee.EventId.EventDate +"::"+ attendee.EventId.EventTime + "::"+ attendee.EventId.Duration +">>")
            log(attendee.EventId._id);
            return attendee.EventId._id + "||" + attendee.EventId.Name +"::"+ attendee.EventId.EventDate +"::"+ attendee.EventId.EventTime + "::"+ attendee.EventId.Duration +">>" +attendee.UserEmailId
          }

        });
        var eventids = [];
        emailids = emailids.filter(function(val){
          if(val)
          return val
        }).join(',')
        emailids = emailids.split(',');
        emailids.sort();
        log("emailids");
        log(emailids);
        //response.send(unique(emailids));
        var unique = require("array-unique").immutable;
        if(emailids.length > 1)
        var cmb = combinatorics.combination(
          unique(emailids)
          , 2);
          log("cmb"); log(cmb);
          speedchat = [];

          if(cmb !== undefined)
          while(a = cmb.next() ) {
            speedchat.push(a);
          }
          //log(speedchat);
          var curatedList = [], lhs='', rhs='', c=0;

          speedchat.map(function(pnTo) {

            lhs = pnTo[0].split('>>');
            rhs = pnTo[1].split('>>');
            //c=0;
            if(lhs[0] === rhs[0]) {
              //curatedList.push(pnTo);
              //log("pnTo " +pnTo);
              c++;
              log('Call list: ' + lhs[0] + " . " + c + " " + lhs[1] + " <--> " + rhs[1]);
              curatedCallList.push( lhs[0] + "++"  + lhs[1] + "<-->" + rhs[1])
            }
            else {
              c=0;
            }

          });
          log("Curated call list");
          log(curatedCallList);
          var evtName, prevName='', cList =[], cl=0;
          var callMap = {};
          if(curatedCallList.length ==0 ) {
            log(job.attrs.name + " <<")
            //killEventsToRestart();

            setTimeout(function() {
              log("curatedCallList - retry");
              job.remove(); agenda.every('20 seconds', 'Events'); console.log('retry'); agenda.start();readJobs();
            }, 30000, "");
          }
          curatedCallList.map(function(callchart) {
            //log("callchart " + callchart);
            var evntId = callchart.split("||");
            var evtName = evntId[1].split("++");
            log("evtName" + evtName[1] + " " + evntId[0]);
            var timeSlot = evtName[0].split("::");
            var duration = timeSlot[3];
            var evtDate = timeSlot[1];
            var evtTime = timeSlot[2];
            log("timeSlot " + timeSlot);
            if(evtName[0] !== prevName) {
              cList = [];
              prevName = evtName[0];
            }
            cList.push(evtName[1] );
            //log("cList " +cList);
            callMap[evntId[0] + "||" + evtName[0]] = cList;
          });
          var timeslot = ''; var agendaName = '';
          for (var i in callMap) {

            log("\n\t"+i + "\n" + callMap[i]+ "\n" );

            var clMpArr = i.split('::');
            timeslot = clMpArr[1] + " " + clMpArr[2];
            var duration = clMpArr[3];
            agendaName = clMpArr[0];


            //======================================================================
            agenda.define(agendaName+' reminder**30mins', function (job, done) {

              sendToEmail(callMap[i].join("<-->"), job);
              //job.touch(function() {});
              //done();
              // 30 minutes
            });
            //======================================================================
            agenda.define(agendaName+' reminder**5mins', function(job, done) {
              //log('\n Event ' + evtS[0]);

              sendToEmail(callMap[i].join("<-->"), job);
              // 5 minutes
              //job.touch(function() {});
              //done();

            });

            log("..." + timeslot + " " + agendaName);
            if(agendaName !== undefined) {
              callbackAgenda(parseCron(timeslot, '30mins'), agendaName+' reminder**30mins');
              callbackAgenda(parseCron(timeslot, '5mins'), agendaName+' reminder**5mins');
            }

            var clUsrMpArr = callMap[i]//.split('<-->');
            var evntId = i.split("||")[0]
            log("callMap[i]"+callMap[i] + " " + evntId);
            var k=clUsrMpArr.length-1; var j=0;
            var jpayload = [];var kpayload = [];
            for(j = 0; j<=clUsrMpArr.length/2; j++) {
              log( k + " k  " + clUsrMpArr[k]);
              log(j + " j " + clUsrMpArr[j]);
              var kToCallers = clUsrMpArr[k].split('<-->');

              var jToCallers = clUsrMpArr[j].split('<-->');


              log("kToCallers[0]" + kToCallers[0])
              //======================================================================
              agenda.define(agendaName + "**" + clUsrMpArr[k], function (job, done) {
                log(kToCallers[0]);
                //job.touch(function() {});
                sendToEmail(kToCallers[0], job);
                //job.touch(function() {});
                //done();

              });
              log("jToCallers[0]" + jToCallers[0])
              //======================================================================
              agenda.define(agendaName + "**" + clUsrMpArr[j], function (job, done) {

                log(jToCallers[0]);
                //job.touch(function() {});
                sendToEmail(jToCallers[0], job);
                //sendToEmail(jToCallers[0], jpayload[j], job);
                //job.touch(function() {});
                //done();
              });

              //======================================================================
              callbackAgenda(parseCron(timeslot, k), agendaName + "**" + clUsrMpArr[k]);
              callbackAgenda(parseCron(timeslot, j), agendaName + "**" + clUsrMpArr[j]);
              if(k==clUsrMpArr.length-1) {

                agenda.define(agendaName + "**closed", function (job, done) {

                  log(callMap[i]);
                  //job.touch(function() {});
                  sendToEmail(callMap[i].join("<-->"), job);
                  //job.touch();
                  done();
                  //job.touch(function() {});
                });
                callbackAgenda(parseCron(timeslot, clUsrMpArr.length), agendaName + "**closed");
              }

              k--;
            }
            // payload initiate....
          }
        });
      });


    });

  }
  //User.remove({lastLogIn: { $lt: twoDaysAgo }}, done);
  log('executed');
  if(db == undefined) {

    setTimeout(function() {
      log("db undefined - retry");
      job.remove();
      agenda.every('20 seconds', 'Events');
      agenda.start();
      readJobs();
    }, 30000, "");
  }
  done();
  //log(evtList);
});

function sendToEmail(email, job) {
  log("sendToEmail " + email);
  log("sendToEmail job " + job.attrs.name);
  // generate payload
  var phash = job.attrs.name.split("**");
  var fromto = phash[1].split("<-->");
  var evtnId = phash[0].split("||");
  var agendaName = evtnId[2];
  log("phash " + phash)
  log("fromto " + fromto + " " + fromto.length)
  log("evtnId " + evtnId)
  var emails;
  if(fromto.length == 1) {
    emails = email.split("<-->");
    var unique = require("array-unique").immutable;
    emails = unique(emails);
    log(emails);
  }


  var token = '';

  if(fromto.length > 1 ){

    var payload = {
      notification: {
        title: "Call now! " + fromto[1] + " is available",
        body: "Speed dating is ongoing & has commenced. Video call now! You," +  fromto[0] + " to " + fromto[1]
      },
      data: {
        duration: "60",
        email: fromto[1],
        type: "eventcall",
        eventId: evtnId[0]
      }
    };
    log("payload");
    log(payload)
    log(fromto[0])
    /*User.find( { "Email" : fromto[0] }, function( err, user ) {
    log("sendToEmail " + user);
    if( !err ) {
    if(user === null) return log(cfg.error);

    user.map(function(usr) {*/
    token = tokenMap[fromto[0]]; //usr.DeviceIdentifier;
    log('FCM token: ' + token + " " + fromto[0] + " " + job.attrs.name);
    if(token !== '') {
      admin.messaging().sendToDevice(token, payload)
      .then(function(response) {
        // See the MessagingDevicesResponse reference documentation for
        // the contents of response.
        log("Successfully sent message:"+ response.successCount+ " " + fromto[0]);
        if(response.successCount === 1) job.remove();
      })
      .catch(function(error) {
        log("Error sending message:", error);
      });
    }
    else {
      log("Device not registered");
    }
    /*
  })

} else {
log( err );
}
}); // User
*/
}
if(fromto.length ==1) {
  //log(emails);
  emails.map(function (email1) {
    log(email1);
    // callend intimation
    var payload3 = {
      notification: {
        title: "Event has ended! ",
        body: "Speed dating completed. You may like ones who you found interesting"
      },
      data: {
        email: email1,
        type: "eventend",
        eventId: evtnId[0]
      }
    };
    var payload2 = {
      notification: {
        title: "Upcoming Event",
        body: "Your Trysto dating event '"+evtnId[1] + "' is due to begin in 5 minutes. Please click here to proceed to your event."
      },
      data : {
        type: "eventstart",
        eventId: evtnId[0]
      }
    };
    //console.log(payload2);
    // 30 minutes intimation
    var payload1 = {
      notification: {
        title: "Event Reminder",
        body: "Your Trysto dating event '" +evtnId[1] + "' is due in 30 minutes. We can't wait to see you there!"
      },
    };



    reminders = job.attrs.name.split("**");
    tailvalue = reminders[reminders.length-1];
    log("tailvalue " + tailvalue)

    var payloadfinal;
    if(tailvalue === '30mins')
    payloadfinal = payload1;
    if(tailvalue === '5mins')
    payloadfinal = payload2;
    if(tailvalue === 'closed')
    payloadfinal = payload3;
    log(payloadfinal);
    log(tokenMap);
    if(tokenMap[email1] === undefined) {
      User.find( { "Email" : email1 }, function( err, user ) {
        log("sendToEmail " + user);
        if( !err ) {
          if(user === null) return log(cfg.error);

          user.map(function(usr) {
            token = usr.DeviceIdentifier;
            tokenMap[usr.Email] = token;
            log('FCM token: ' + token + " " + email1 + " " + job.attrs.name);
            if(token !== '') {
              admin.messaging().sendToDevice(token, payloadfinal)
              .then(function(response) {
                // See the MessagingDevicesResponse reference documentation for
                // the contents of response.
                log("Successfully sent message:"+ response.successCount + " " + email1);
                //if(response.successCount == 1)
                job.remove();
              })
              .catch(function(error) {
                log("Error sending message:", error);
              });
            }
            else {
              log("Device not registered");
            }
            /*registrationToken.map(function(tken) {
            sendToFCMToken(tken, payload);
          });*/
        })
        log('tokenMap');
        log(tokenMap);

      } else {
        log( err );
      }
    }); // User
  }
  else {
    token = tokenMap[email1];
    log('FCM token: ' + token + " " + email1 + " " + job.attrs.name);
    if(token !== '') {
      admin.messaging().sendToDevice(token, payloadfinal)
      .then(function(response) {
        // See the MessagingDevicesResponse reference documentation for
        // the contents of response.
        log("Successfully sent message:"+ response.successCount + " " + email1);
        //if(response.successCount == 1)
        job.remove();
      })
      .catch(function(error) {
        log("Error sending message:" + error);
      });
    }
    else {
      log("Device not registered");
    }
  }

})


}

}



function sendToFCMToken(token, payload) {
  admin.messaging().sendToDevice(token, payload)
  .then(function(response) {
    // See the MessagingDevicesResponse reference documentation for
    // the contents of response.
    log("Successfully sent message:" +response.successCount);
  })
  .catch(function(error) {
    log("Error sending message:" + error);
  });
}

function parseCron(evt, span) {
  var evtDate =  evt.toDate("dd/mm/yyyy hh:ii:ss");
  var aNeatFewminsLess = new Date();
  log("Span " + span)
  if(span === '30mins') {
    aNeatFewminsLess = new Date( evtDate.getTime() - 1000 * 60 * 2);
  }
  if(span === '5mins') {
    aNeatFewminsLess = new Date( evtDate.getTime() - 1000 * 60 * 1);
  }
  if(span !== '30mins' && span !== '5mins') {
    aNeatFewminsLess = new Date( evtDate.getTime() + 1000 * 60 * (parseInt(span)+1));
  }
  var timeslot = aNeatFewminsLess.getMinutes() + " " + aNeatFewminsLess.getHours() + " " + aNeatFewminsLess.getDate() + " " + (aNeatFewminsLess.getMonth()) + " *";
  log(timeslot);
  //log(evt + " " + span);
  return timeslot;
}

function callbackAgenda(tm,ev) {
  log('\n\ncallbackAgenda ' + tm + "..." + ev);
  agendaList.push(tm + "::" + ev);
  agenda.every(tm, ev);
  agenda.start();
  readJobs();
}


agenda.on('ready', function() {
  //agenda.now('Cleanup');

  log('Event lookup - onReady');
  agenda.every('20 seconds', 'Events');
  //agenda.every('1 minute','ReadJobs');
  //job.repeatEvery('10 seconds', 'checkEvent');
  //job.save();
  // Alternatively, you could also do:
  //agenda.process('*/1 * * * *', 'Events');
  log('AgendaList');
  log(agendaList);
  // agenda.every( m h d m dy)
  agenda.start();
  //log(evtList);
  readJobs();
});

function readJobs() {
  agenda.jobs({}, function(err, jobs) {
    // Work with jobs (see below)
    jobs.map(function(job) {
      //log(job.attrs.name);
      //job.touch(function() {
      var l = new Date(job.attrs.nextRunAt).valueOf() - new Date().valueOf();
      var m = l / 86400;

      if( l /1000 > 360) job.remove();
      log(".")

      //log('job refreshed ' + job.attrs.name);
      //  if( l /1000 > 360) agenda.now('Cleanup',"1")
      //job.save();
      //log(job.attrs);
      //})


    })
  });
}

/*agenda.on('complete', function(job) {
log("Job finished"+ job.attrs.name);
//job.touch(function() { log('unlocked') });
if(job.attrs.name !== 'Events')
job.remove();
log(agendaList);
});*/


String.prototype.toDate = function(format)
{
  var normalized      = this.replace(/[^a-zA-Z0-9]/g, '-');
  var normalizedFormat= format.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  var formatItems     = normalizedFormat.split('-');
  var dateItems       = normalized.split('-');

  var monthIndex  = formatItems.indexOf("mm");
  var dayIndex    = formatItems.indexOf("dd");
  var yearIndex   = formatItems.indexOf("yyyy");
  var hourIndex     = formatItems.indexOf("hh");
  var minutesIndex  = formatItems.indexOf("ii");
  var secondsIndex  = formatItems.indexOf("ss");

  var today = new Date();

  var year  = yearIndex>-1  ? dateItems[yearIndex]    : today.getFullYear();
  var month = monthIndex>-1 ? dateItems[monthIndex]-1 : today.getMonth()-1;
  var day   = dayIndex>-1   ? dateItems[dayIndex]     : today.getDate();

  var hour    = hourIndex>-1      ? dateItems[hourIndex]    : today.getHours();
  var minute  = minutesIndex>-1   ? dateItems[minutesIndex] : today.getMinutes();
  var second  = secondsIndex>-1   ? dateItems[secondsIndex] : today.getSeconds();

  return new Date(year,month,day,hour,minute,second);
};


function killEventsToRestart(){
  agenda.jobs({},function(err, jobs) {
    jobs.map(function(jb) {
      //log(jb);
      log('removed old job' + jb.attrs.name + " .." +jb.attrs.nextRunAt + ";;  ");
      if(jb.attrs.name == 'Events')jb.remove();
    });
  })};


  function graceful() {
    log('graceful exit - problem');
    agenda.now('Cleanup', "1")

    agenda.stop(function() {
      process.exit(0);
    });
  }

  function log(msg) {
    if(msg !== null && typeof msg === 'object') {
      console.log(new Date().toISOString() + " |> ");
      console.log(msg);
    }
    else
    console.log(new Date().toISOString() + " |> "+ msg);
  }
  process.on('SIGTERM', graceful);
  process.on('SIGINT' , graceful);
