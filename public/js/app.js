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

(function($){
  // get the base location
  if (!window.location.origin){
    window.location.origin = window.location.protocol+"//"+window.location.host;
  }
  // DOM ready
  $(function(){
    var mLinks = $("#mLinks p"),
        spin = $("<img class='spin' />").attr("src", "/img/spinner.gif");
    // progress indicator
      mLinks.append(spin);
    spin.hide();

    // templates using {{ }} as delimiters
    _.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };
    var displayTemplate = _.template($("#mLinks-display-template").html());
    var unsafeTemplate = _.template($("#mLinks-unsafe-template").html());
    var formTemplate = _.template($("#mLinks-form-template").html());
    var redirectTemplate =  _.template($("#mLinks-redirect-template").html());
    var sortUrl = "";
    var aUrl = "";
    // Form
    window.mLinksFormSubmit = function(){
      var url = $("input:first").val();
        var vanityUrl = $("#vanity-url-input").val();
        if(url.length < 8) {
            $("input:first").focus();
            return;
        }
        var img = $("#arraow-img").attr("src");
        if(img == "/img/up.png" && vanityUrl == "") {
            $("#vanity-url-input").focus();
            return;
        }
        $("#mLinks-url-form").hide();
        spin.show();
        aUrl = url;
      $.post("/shortURL", {url: url, vanityUrl:vanityUrl}, function(data){
        spin.hide();
        if(!data.success) {
            mLinks.append(unsafeTemplate({
            urlOne: "<span style='font-weight: bold;'>Current status for:</span> " + url,
            error: data.error
          }));
          return;
        }
         sortUrl = data.surl;
         aUrl = "";
         mLinks.append(displayTemplate({
          urlOne: url,
          urlTwo:  window.location.origin + "/" + data.surl
        }));
          $("#shortern-url").select();
      });
    };
      window.showFormTemplate = function() {
          mLinks.empty().append(formTemplate({url:aUrl, vanityUrl:window.location.origin + "/"}));
      }
      window.copyUrl = function(url) {
          var copyButton = $("#copy-link");
          copyButton.zclip({
              path: '/js/vendor/ZeroClipboard.swf',
              copy:url,
              beforeCopy: function () {
                  console.log("before copy");
              },
              afterCopy: function () {
                  alert('after copy');
              }
          });
          setTimeout(function(){
              copyButton.click();
          },100);
      }
      window.toggleVanity = function() {
          $("#vanity-url").slideToggle();
          var img = $("#arraow-img").attr("src");
          if(img == "/img/down.png") {
              $("#arraow-img").attr("src", "/img/up.png");
          } else {
              $("#arraow-img").attr("src", "/img/down.png");
          }
      }
    // we want to extned an url so display resolved and redirect
    if(window.mLinksSurl !== "false") {
      spin.show();
      $.post("/extn", { surl: window.mLinksSurl }, function(data){
        var surl = window.location.origin + "/" + window.mLinksSurl;
        spin.hide();
        if(data.error === "Error") {
            mLinks.append(displayTemplate({
            urlOne: surl,
            urlTwo: "System Error, try again later"
          }));
          return;
        }
        if(data.error === "Not found") {
            mLinks.append(displayTemplate({
            urlOne: surl,
            urlTwo: "Not found"
          }));
          return;
        }
        mLinks.append(redirectTemplate({
              urlOne: surl,
              urlTwo: "Redirecting in 3sec " + data.url
        }));
          var i = 3;
          setInterval(function(){
              if(i>0){
                  mLinks.empty().append(redirectTemplate({
                      urlOne: surl,
                      urlTwo: "Redirecting in "+--i+" sec " + data.url
                  }));
              }
          }, 1000);
        setTimeout(function() {
            mLinks.empty().append(redirectTemplate({
                urlOne: surl,
                urlTwo: "Redirecting..."
            }));
          window.location = data.url;
        }, 4000);
      });
    } else {
    // display form to shorten Url
        mLinks.append(formTemplate({url:"", vanityUrl:window.location.origin + "/"}));
    }
  });
})(jQuery);
