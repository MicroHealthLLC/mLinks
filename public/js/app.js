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
    var vanityTemplate = _.template($("#mLinks-vanity-template").html());
      var vanityDisplayTemplate = _.template($("#mLinks-vanity-display-template").html());
      var redirectTemplate =  _.template($("#mLinks-redirect-template").html());
    var sortUrl = "";
    // Form
    window.mLinksFormSubmit = function(){
      $("#mLinks-url-form").hide();
      spin.show();
      var url = $("input:first").val();
      $.post("/shortURL", {url: url}, function(data){
        spin.hide();
        if(!data.success) {
            mLinks.append(unsafeTemplate({
            urlOne: "Current status for " + url,
            error: data.error
          }));
          return;
        }
          sortUrl = data.surl;
         mLinks.append(displayTemplate({
          urlOne: url,
          urlTwo:  window.location.origin + "/" + data.surl
        }));
      });
    };

      window.mLinksVanitySubmit = function(){
          $("#mLinks-vanity-form").hide();
          spin.show();
          var url = $("#vanity-url-input").val();
          console.log(url, "url");
          $.post("/vanityURL", {vanityUrl: url, sortUrl: sortUrl}, function(data){
              spin.hide();
              if(!data.success) {
                  mLinks.append(unsafeTemplate({
                      urlOne: "Current status for " + url,
                      error: data.error
                  }));
                  return;
              }
              console.log({
                  url: data.res.url,
                  sortUrl:  window.location.origin + "/" + sortUrl,
                  urlVanity : data.res.vanityUrl
              });
              mLinks.empty().append(vanityDisplayTemplate({
                  url: data.res.url,
                  sortUrl:  window.location.origin + "/" + sortUrl,
                  vanityUrl : data.res.vanityUrl
              }));
          });
      };

      window.showFormTemplate = function() {
          mLinks.empty().append(formTemplate({}));
      }
      window.showVanityTemplate = function() {
          mLinks.empty().append(vanityTemplate({placeholder: "Vanity url for " + window.location.origin + "/" + sortUrl}));
      }
      window.copyUrl = function(url) {
          var copyButton = $("#copy-link");
          copyButton.zclip({
              path: '/js/vendor/ZeroClipboard.swf',
              copy:url,
              beforeCopy: function () {
                  console.log("test");
              },
              afterCopy: function () {
                  alert('after copy');
              }
          });
          setTimeout(function(){
              copyButton.click();
          },100);
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
        mLinks.append(formTemplate());
    }
  });

})(jQuery);
