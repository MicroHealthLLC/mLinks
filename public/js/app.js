(function($){
  // get the base location
  if (!window.location.origin){
    window.location.origin = window.location.protocol+"//"+window.location.host;
  }
  // DOM ready
  $(function(){
    var mLinks = $("#mLinks"),
        spin = $("<img />").attr("src", "/img/spinner.gif");
    // progress indicator
      mLinks.append(spin);
    spin.hide();

    // templates using {{ }} as delimiters
    _.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };
    var displayTemplate = _.template($("#mLinks-display-template").html());
    var unsafeTemplate = _.template($("#mLinks-unsafe-template").html());
    var formTemplate = _.template($("#mLinks-form-template").html());

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
            urlTwo: data.error
          }));
          return;
        }
         mLinks.append(displayTemplate({
          urlOne: url,
          urlTwo:  window.location.origin + "/" + data.surl
        }));
      });
    };


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
          mLinks.append(displayTemplate({
          urlOne: surl,
          urlTwo: "Redirecting in 3sec " + data.url
        }));
        setTimeout(function() {
          window.location = data.url;
        }, 3000);
      });
    } else {
    // display form to shorten Url
        mLinks.append(formTemplate());
    }
  });

})(jQuery);
