  $('#openapitesterhistorydetails, #openapitesterhistorydetailslink').click(function() {
    chrome.runtime.sendMessage({type: "gaq", target: "View_openapitester_history", behavior: "clicked"});
    chrome.tabs.create({
      url: 'openapitester/openapitester-history.html'
    });
  });


  function loadOpenAPIResults(openapi_result){
    $("#openapiresults-js").empty();
     console.log(openapi_result.requestId);
     console.log(openapi_result.raw_response);

     
     var html1 = '<div class="card-content black-text"><table>';
     html1 += '<tr class="shown">';
     html1 += '<td colspan="10">';
     html1 += '<table class="history-table">';
     
     var better1_title = {
       raw_response: "Raw Response",
       lastupdated: "Last Updated",
       requestedTime: "Request Time",
       token_desc: "Credential Used",
       requestId: "Request Id",
       status: "Response Status",
       method: "HTTP Method",
       endpoint: "API endpoint",
       body_data: "POST Payload"

     }
 
     var arr1_keys = Object.keys(openapi_result).reverse();
 
     for(var i=0; i < arr1_keys.length; i++) {
       let key1 = arr1_keys[i];
       var text1 = "";
       if (jQuery.type(openapi_result[key1]) == 'object' && key1 != 'token_desc') {
         text1 = "<pre>" + JSON.stringify(openapi_result[key1], null, 2) + "</pre>";
       } else if (jQuery.type(openapi_result[key1]) == 'array') {
         for(var k=0; k < openapi_result[key1].length; k++) {
           text1 += "<p>" + openapi_result[key1][k] + "</p>";
         }
       } else if (key1 == 'token_desc') {
         text1 = openapi_result[key1];
       } else {
         text1 = openapi_result[key1];
       }
       html1 += "<tr><td><b>" + better1_title[key1] + "</b></td><td>" + text1 + "</td></tr>";
     }
     html1 += '</table>';
     html1 += '</td>';
     html1 += '</tr>';
     html1 += '</table></div>';

     //var result = $('div').append(html1).find('#openapiresults-js').html();
    // var openapiresult = $('#openapiresults-js');
     //var this1_obj = $(this);
    // var this1_html = $(this).html();
     //console.log(this1_html);
     //console.log(this1_obj);
    // this1_obj.html(openapi_result.raw_response);
    chrome.runtime.sendMessage({
        msg: "openapi_response_completed", 
        data: {
            subject: "XHR response",
            content: html1
        }
    });
}

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
        $('.openapiresults-js').empty();
        $('.openapiresults-js').append('<div style="style="padding-top: 10px; padding-bottom: 10px;"><div class="progress orange lighten-1"><div class="indeterminate orange lighten-5"></div></div></div>');
          var submit_buttons = $('#openapitester-submitButton');
          var this_obj = $(this);
          var this_html = $(this).html();
          submit_buttons.addClass("disabled");
          this_obj.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
          chrome.runtime.getBackgroundPage(function(backgroundpage) {
            backgroundpage.makeOpenAPIReq(arr_target_openapiendpoint.filter(Boolean), arr_target_method, body_data, function(request_result) {
                submit_buttons.removeClass("disabled").blur();
                console.log(JSON.stringify(request_result));
                this_obj.html(this_html);
              });
          });
      }
  });
  