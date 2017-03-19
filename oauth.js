var express = require('express'),
    bodyParser = require('body-parser'),
    oauthserver = require('oauth2-server'),
    mongoose = require('mongoose');

    var uristring = 'mongodb://localhost/OAuth2';

    // Makes connection asynchronously. Mongoose will queue up database
    // operations and release them when the connection is complete.
    mongoose.connect(uristring, function (err, res) {
      if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
        console.log ('Succeeded connected to: ' + uristring);
      }
    });
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.oauth = oauthserver({
  model: require('./oauthuser'), // See below for specification
  grants: ['password'],
  debug: true
});

app.all('/oauth/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), function (req, res) {
  console.log(req.body);
  res.send('Secret area');
});

app.use(app.oauth.errorHandler());

app.listen(3000);
