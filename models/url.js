/*
 * URL model
 */
var redis = require("redis");
var url = require("url");

var URL = function() {
  var that = {};
  var counter;

  var urlValidationExp = /^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/;
  var ipValidationExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  function isValidUrl(url) {
     return urlValidationExp.test(url);
  }
  function isVlidIP(ip) {
    return ipValidationExp.test(ip);
  }
  function isMixOfIpAndQuary(url) {
      if(url.indexOf("http://") == 0){
          url = url.slice(8, url.length);
      } else if(url.indexOf("https://") == 0){
          url = url.slice(9, url.length);
      }
      var array = url.split(".");
      var ip = "";

      for(var x = 0; x < 4; x++) {
          ip = ip + "" + (ip !== "" ? "."+parseInt(array[x]):parseInt(array[x]));
      }
      return isVlidIP(ip);
  }
  URL.connection().setnx("counter", 0, function(err, res) {
    if(err) throw "Initialization failed";
    if(res === 1) {
      counter = 0;
    } else {
      db.get("counter", function(err, res) {
        if(err) throw "Initialization failed";
        counter = parseInt(res, 10);
      });
    }
  });
    that.remove = function() {
        var con = URL.connection();
        con.keys('*', function (err, keys) {
            if (err) return console.log(err);
            var i = -1;
            var next = function() {
                i++;
                if(i < keys.length) {
                    con.get(keys[i], function(err, res) {
                       if(err || res == 1){
                           next();
                       } else {
                           var res = JSON.parse(res);
                           if(res && res.lastUsed) {
                               var timeDiff = Math.abs(new Date().getTime() - new Date(res.lastUsed).getTime());
                               var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                               if(diffDays >= 365) {
                                   con.del(keys[i]);
                               }
                           }
                           next();
                       }

                    });
                }
            }
            next();
        });
    }

  that.get = function(surl, cb) {
    URL.connection().get(surl, function(err, res) {
      if(err) {
        cb(err);
        return;
      }
        res = JSON.parse(res);
        res.lastUsed = new Date();
        URL.connection().set(surl, JSON.stringify(res), function(err, r) {
            if(err) {
                cb(err);
                return;
            }
            cb(null, res);
        });
    });
  };
  that.create = function(url, vanityUrl, cb) {
    if(!isValidUrl(url) && !isVlidIP(url) && !isMixOfIpAndQuary(url)) {
      cb("The url cannot be shortened because its unsafe.");
      return;
    }
    if(vanityUrl && vanityUrl != "") {
        URL.connection().get(vanityUrl, function(err, res) {
            if(err) {
                cb(err);
                return;
            }
            if(res) {
                cb("Vanity url already taken.");
            } else {
                URL.connection().set(vanityUrl, JSON.stringify({
                    url:url,
                    lastUsed:new Date()
                }), function(err, res) {
                    if(err) {
                        cb(err);
                        return;
                    }
                    cb(null, vanityUrl);
                });
            }
        });
    } else {
        URL.connection().incr("counter", function(err, res) {
            if(err) {
                cb(err);
                return;
            }
            key = res.toString(32);
            URL.connection().set(key, JSON.stringify({
                url:url,
                lastUsed:new Date()
            }), function(err, res) {
                if(err) {
                    cb(err);
                    return;
                }
                cb(null, key);
            });
        });
    }
  };
  return that;
};
var db = null;
URL.connection = function() {
  if(db) return db; // already connected

  if(process.env.REDISTOGO_URL) {
    var redisToGo = url.parse(process.env.REDISTOGO_URL);
    db = redis.createClient(redisToGo.port, redisToGo.hostname);
    db.auth(redisToGo.auth.split(":")[1]);
  } else {
    // asume local redis
    db = redis.createClient();
  }
  return db;
};
URL.closeConnection = function() {
  if(db) db.quit();
  db = null;
};
module.exports = URL;
