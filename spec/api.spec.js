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

process.env.NODE_ENV = "test";
process.env.PORT = 9876;

var server = require("../app.js");
var URL = require("../models/url");
var request = require("request");

describe("API", function() {
  var baseUrl = "http://localhost:" + process.env.PORT;
  var _server;

  beforeEach(function() {
    var done = false;
    runs(function() {
      _server = server.listen(process.env.PORT, function(err) {
        done = true;
      });
    });
    waitsFor(function() {
      return done;
    });
  });

  afterEach(function() {
    _server.close();
    URL.closeConnection();
  });

  it("gets /", function(done) {
    request.get(baseUrl + "/", function(err, res, body) {
      expect(res.statusCode).toBe(200);
      done();
    });
  });

  it("get /1", function(done) {
    request.get(baseUrl + "/1", function(err, res, body) {
      expect(res.statusCode).toBe(200);
      done();
    });
  });

  it("post /mLinks", function(done) {
    request.post(
      { url: baseUrl + "/mLinks", json: { url: "http://example.com" } },
      function(err, res, body) {
        expect(res.statusCode).toBe(200);
        done();
      }
    );
  });

  it("does not allow invalid urls in post /mLinks", function(done) {
    request.post(
      { url: baseUrl + "/mLinks", json: { url: "invalid" } },
      function(err, res, body) {
        expect(body.error).toBeNotNull();
        done();
      }
    );
  });

  it("post /extn", function(done) {
    request.post(
      { url: baseUrl + "/extn", json: { surl: "1" } },
      function(err, res, body) {
        expect(res.statusCode).toBe(200);
        done();
      }
    );
  });

});
