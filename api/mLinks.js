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
    app.post("/vanityURL", function(req, response) {
        url.vanityURL(req.body.sortUrl, req.body.vanityUrl, function(err, res) {
            if(err) {
                resp = {success:false, error: "The url cannot be shortened because its unsafe."};
            } else {
                resp = {success:true, res: res};
            }
            response.send(resp);
        });
    });
  app.post("/shortURL", function(req, response) {
    url.create(req.body.url.trim(), function(err, res) {
      if(err) {
        resp = {success:false, error: "The url cannot be shortened because its unsafe."};
      } else {
        resp = {success:true, surl: res};
      }
      response.send(resp);
    });
  });
};

module.exports = mLinks;
