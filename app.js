/**
* Module dependencies.
*/

var express = require("express"),
    jsonMiddleware = require("json-middleware"),
    bodyParser = require("body-parser"),
    errorHandler = require("errorhandler"),
    http = require("http"),
    mLinks = require("./api/mLinks")
    URL = require("./models/url");

var app = express(),
    server = http.createServer(app);

module.exports = server;


// Configuration
var port = process.env.PORT || 3000,
    env = process.env.NODE_ENV || "development";

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(jsonMiddleware.middleware());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express['static'](__dirname + '/public'));

var s = mLinks({ app: app});

if(["development", "test"].indexOf(env) !== -1) {
  app.use(errorHandler({
    dumpExceptions: true,
    showStack: true }
  ));
} else {
  app.use(errorHandler());
}

// Startup
if(process.env.NODE_ENV !== "test") {
  server.listen(port, function(){
    console.log("mLinks server listening on port " + port + " in " + env + " mode");
      setInterval(function() {
          URL().remove();
      },(1000 * 3600 * 12));
  });
}
