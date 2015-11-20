/**
 *   Copyright (C) 2015  MicroHealthLLC
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.

 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

/**
 *
 * @type {*|exports|module.exports}
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
