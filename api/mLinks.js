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

/*
 * mLink API
 * opts = {
 *  db: REDISCONNECTION,
 *  app: APPLICATION
 * }
 */
var URL = require("../models/url");

var mLinks = function(opts) {
  // routes
  var app = opts.app;
  var url = URL();

  // Handle interface loading
  app.get("/", function(req, res) {
    res.render("mLinks", { surl: false });
  });
  app.get("/:surl", function(req, res) {
    res.render("mLinks", { surl: req.params.surl });
  });
  // Extend and shorten urls
  app.post("/extn", function(req, response) {
    url.get(req.body.surl, function(err, res) {
      if(err) {
        resp = {"error": "Error"};
      } else {
        if(res === null) {
          resp = {"error": "Not found"};
        } else {
          resp = res;
        }
      }
      response.send(resp);
    });
  });

  app.post("/shortURL", function(req, response) {
    url.create(req.body.url.trim(), req.body.vanityUrl.trim(), function(err, res) {
      if(err) {
        resp = {success:false, error: err};
      } else {
        resp = {success:true, surl: res};
      }
      response.send(resp);
    });
  });
};

module.exports = mLinks;
