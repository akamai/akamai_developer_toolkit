  $('#openapitesterhistorydetails, #openapitesterhistorydetailslink').click(function() {
    chrome.runtime.sendMessage({type: "gaq", target: "View_openapitester_history", behavior: "clicked"});
    chrome.tabs.create({
      url: 'openapitester/openapitester-history.html'
    });
  });


  function loadOpenAPIResults(openapi_result){
    $("#openapiresults-js").empty();
    $('.openapiresppayload-js').empty();
    $('.openapirespheaders-js').empty();
    $('.openapireqheaders-js').empty();
    $('.openapireqpayload-js').empty();

    // console.log(openapi_result.requestId);
   //console.log(openapi_result.raw_response);

     
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
       body_data: "POST Payload",
       response_headers: "Response Headers",
       respreq_time: "Total time for request response"

     }

     var loadresponse_payload = '<pre style="font-size: 1.0rem; background-color: white">' + JSON.stringify(openapi_result.raw_response, null, 2) + '</pre>';


     var loadresponse_headers = '<pre style="font-size: 1.0rem;">' + openapi_result.response_headers.replace('\r\n', '<br>') + '</pre>'; 

    var loadrequest_payload = '<pre style="font-size: 1.0rem; background-color: white">' + openapi_result.body_data + '</pre>';
     
    var loadresp_time = '<p style="margin-top: 10px;">Time taken for response:<span class="new badge" style="margin-top:-5px;" data-badge-caption="ms">'+ openapi_result.respreq_time + '</span></p><br><br>'
    //need to define this
   // var loadrequest_headers ={
   //   body_data: "Request Payload"
   // }
 
   //defining HTML for detailed view
     var arr1_keys = Object.keys(openapi_result).reverse();
     for(var i=0; i < arr1_keys.length; i++) {
       let key1 = arr1_keys[i];
       var text1 = "";
      
       if (jQuery.type(openapi_result[key1]) == 'object'|| jQuery.type(openapi_result[key1]) == 'array' && key1 != 'token_desc') {
         
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

     //defining html for response payload
     var html2 = '<div class="card-content black-text">';
     html2 += ''+ loadresponse_payload + '</div>';
     //console.log(html2);

     //defining html for response headers
     var html3 = '<div class="card-content black-text">';
     html3 += ''+ loadresponse_headers + '</div>'; 

    //defining html for request payload
      var html4 = '<div class="card-content black-text">';
      html4 += ''+ loadrequest_payload + '</div>'; 
      
     
     //message to send detailed response to popup.js
    chrome.runtime.sendMessage({
        msg: "openapi_response_completed", 
        data: {
            subject: "XHR response",
            content: html1
        }
    });
     //message to send detailed response payload to popup.js
    chrome.runtime.sendMessage({
      msg: "openapi_response_payload", 
      data: {
          subject: "XHR1 response",
          content: html2
      }
  });
     //message to send detailed response headers to popup.js
  chrome.runtime.sendMessage({
    msg: "openapi_response_headers", 
    data: {
        subject: "XHR2 response",
        content: html3
    }
});
     //message to send detailed request payload to popup.js
     chrome.runtime.sendMessage({
      msg: "openapi_request_payload", 
      data: {
          subject: "XHR3 response",
          content: html4
      }
  });
     //message to send total time to popup.js
     chrome.runtime.sendMessage({
      msg: "openapi_response_time", 
      data: {
          subject: "XHR4 response",
          content: loadresp_time
      }
  });

}

  $('#openapitester-submitButton').click(function(obj) {
      chrome.runtime.getBackgroundPage(function(backgroundpage) {
          backgroundpage._gaq.push(['_trackEvent', 'Submit_openapitester_req', 'clicked']);
      });

      var arr_target_openapiendpoint = $('#openapiendpoint').val().split("\n");
      var arr_target_method = $('#openAPImethod').prop('value');
      var arr_target_headersname = $('#addheadersname').val().split("\n");
      var arr_target_headersvalue = $('#addheadersvalue').val().split("\n");
      var arr_target_addpostbody = $('#addpostbody').val();
      body_data = arr_target_addpostbody.replace(/\n/g,"");
      //console.log(body_data);
      var submit_buttons = $('#openapitester-submitButton');
      if (arr_target_openapiendpoint.filter(Boolean).length == 0) {
          Materialize.toast('Please enter an API endpoint', 1500);
          return false;
      } else {
        //empty previous response request results from div
        $('.openapiresults-js').empty();
        $('.openapiresppayload-js').empty();
        $('.openapirespheaders-js').empty();
        $('.openapireqheaders-js').empty();
        $('.openapireqpayload-js').empty();
        //inject spinner into div
        $('.openapiresults-js').append('<div style="style="padding-top: 10px; padding-bottom: 10px;"><div class="progress orange lighten-1"><div class="indeterminate orange lighten-5"></div></div></div>');
        $('.openapiresppayload-js').append('<div style="style="padding-top: 10px; padding-bottom: 10px;"><div class="progress orange lighten-1"><div class="indeterminate orange lighten-5"></div></div></div>');
        $('.openapirespheaders-js').append('<div style="style="padding-top: 10px; padding-bottom: 10px;"><div class="progress orange lighten-1"><div class="indeterminate orange lighten-5"></div></div></div>');
        $('.openapireqheaders-js').append('<div style="style="padding-top: 10px; padding-bottom: 10px;"><div class="progress orange lighten-1"><div class="indeterminate orange lighten-5"></div></div></div>');
        $('.openapireqpayload-js').append('<div style="style="padding-top: 10px; padding-bottom: 10px;"><div class="progress orange lighten-1"><div class="indeterminate orange lighten-5"></div></div></div>');


        var submit_buttons = $('#openapitester-submitButton');
          var this_obj = $(this);
          var this_html = $(this).html();
          submit_buttons.addClass("disabled");
          this_obj.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
          chrome.runtime.getBackgroundPage(function(backgroundpage) {
            backgroundpage.makeOpenAPIReq(arr_target_openapiendpoint.filter(Boolean), arr_target_method, arr_target_headersname, arr_target_headersvalue, body_data, function(request_result) {
                submit_buttons.removeClass("disabled").blur();
                this_obj.html(this_html);
              });
          });
      }
  });
  