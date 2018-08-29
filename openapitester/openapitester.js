  $('#openapitesterhistorydetails, #openapitesterhistorydetailslink').click(function() {
    chrome.runtime.sendMessage({type: "gaq", target: "View_openapitester_history", behavior: "clicked"});
    chrome.tabs.create({
      url: 'openapitester/openapitester-history.html'
    });
  });
  
  $('#openapitester-submitButton').click(function(obj) {
      chrome.runtime.getBackgroundPage(function(backgroundpage) {
          backgroundpage._gaq.push(['_trackEvent', 'Submit_openapitester_req', 'clicked']);
      });

      var arr_target_openapiendpoint = $('#openapiendpoint').val().split("\n");
      var arr_target_method = $('#openAPImethod').prop('value');
      //var arr_target_headersname = $('#addheadersname').val().split("\n");
      //var arr_target_addheadersvalue = $('#addheadersvalue').val().split("\n");
      var arr_target_addpostbody = $('#addpostbody').val();
      body_data = arr_target_addpostbody.replace(/\n/g,"");
      console.log(body_data);
      var submit_buttons = $('#openapitester-submitButton');
      if (arr_target_openapiendpoint.filter(Boolean).length == 0) {
          Materialize.toast('Please enter an API endpoint', 1500);
          return false;
      } else {
          var submit_buttons = $('#openapitester-submitButton');
          var this_obj = $(this);
          var this_html = $(this).html();
          submit_buttons.addClass("disabled");
          this_obj.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
          chrome.runtime.getBackgroundPage(function(backgroundpage) {
            backgroundpage.makeOpenAPIReq(arr_target_openapiendpoint.filter(Boolean), arr_target_method, body_data, function(request_result) {
                submit_buttons.removeClass("disabled").blur();
                this_obj.html(this_html);
              });
          });
      }
  });
  