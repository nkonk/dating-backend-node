var express = require("express");

var app = express();


app.configure( function() {

// ## CORS middleware
// 
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('X-Total-Count','1000');
    res.header('Access-Control-Expose-Headers','X-Total-Count');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

});

app.get('/event',function(req,resp){
    
    var data = [{
        _id:1,
        name:"Jockey"
    },
    {
        _id:5,
        name:"Kindo"
    },
    {
        _id:3,
        name:"Ubuntu",
        age:"loose"
    }
    ];
    resp.send(data);
});

app.listen(8081)