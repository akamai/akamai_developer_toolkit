
var initOpenAPIStorage = function() {
    console.log("initializing OPENAPI Storage");
    chrome.storage.local.get("openapiHistory", function(result) {
      if(result['openapiHistory'] == undefined) {
        chrome.storage.local.set({'openapiHistory': {}});
      }  
    });
  }
  

function saveOpenAPIResult(openapi_result) {
  chrome.storage.local.get('openapiHistory', function(records) {
    var openapi_history = records['openapiHistory'];
    openapi_history[openapi_result.requestId] = openapi_result;  
    chrome.storage.local.set({ openapiHistory: openapi_history });
    console.log("New OpenAPI record added");
  });
}



  
var OnRequestSuccess = function(response, status, obj_request, jqappxhr, respp_time) {
  _gaq.push(['_trackEvent', 'OpenAPI_req_successful', 'yes']);
  var openapireq_result = {
    'lastupdated': getCurrentDatetimeUTC(),
    'requestedTime': obj_request.requestedTime,
    'endpoint': obj_request.endpoint,
    'method': obj_request.method,
    'body_data': obj_request.body_data,
    'response_headers': jqappxhr.getAllResponseHeaders(),
    'raw_response': response,
    'token_desc': obj_request.token_desc,
    'requestId': obj_request.requestId,
    'status': 'success',
    'respreq_time': respp_time
  };
  //console.log(openapireq_result.respreq_time);
  saveOpenAPIResult(openapireq_result);
  loadOpenAPIResults(openapireq_result);
  showListNotification("OpenAPI", "Request Success", openapireq_result, img_success);
}

    var OnRequestError = function(xhr, status, error, obj_request, respe_time) { 
      var openapireqerror_result = {
        'lastupdated': getCurrentDatetimeUTC(),
        'requestedTime': obj_request.requestedTime,
        'endpoint': obj_request.endpoint,
        'method': obj_request.method,
        'body_data': obj_request.body_data,
        'response_headers': xhr.getAllResponseHeaders(),
        'raw_response': '',
        'token_desc': obj_request.token_desc,
        'requestId': obj_request.requestId,
        'status': 'fail',
        'respreq_time': respe_time
      };
      try {
        openapireqerror_result['raw_response'] = JSON.parse(xhr.responseText);
      } catch (err) {
        openapireqerror_result['raw_response'] = {detail: 'Could not make API request'};
      }
      saveOpenAPIResult(openapireqerror_result);
      loadOpenAPIResults(openapireqerror_result);
      showListNotification("OpenAPI", "Request Failed", openapireqerror_result, img_fail);
  }
  
  
  function makeOpenAPIReq(arr_openapiendpoint, arr_method, arr_headersname, arr_headersvalue, arr_addpostbody, callback) {
     // console.log(arr_method);
     // console.log(arr_openapiendpoint);
    //  console.log(arr_addpostbody);
    //  console.log(arr_headersname);
    //  console.log(arr_headersvalue);

     // if(!checkActiveCredential("luna")){
     //   callback();
      //  return;
      //}
      var arr_headernamevalue = {};
      arr_headernamevalue [arr_headersname] = arr_headersvalue;
      if (arr_method == "GET"){
        var obj_request = {
          url: activatedTokenCache.baseurl + arr_openapiendpoint,
          endpoint: arr_openapiendpoint,
          method: arr_method,
          headernamevalue: arr_headernamevalue,
          headername: arr_headersname,
          headervalue: arr_headersvalue,
          auth_header: authorizationHeader({method: "GET", tokens: activatedTokenCache, endpoint: arr_openapiendpoint}),
          requestId: "OpenAPI_" + new Date().getTime().toString(),
          token_desc: activatedTokenCache.desc,
          requestedTime: getCurrentDatetimeUTC()
        }
        sendGetReq(obj_request, OnRequestSuccess, OnRequestError);
        showBasicNotification("OPEN API GET Requested", "You will get notified shortly");
        sleep(Math.floor((Math.random() * 1000) + 100), callback);
      }
      if(arr_method == "POST"){
        var obj_request = {
          url: activatedTokenCache.baseurl + arr_openapiendpoint,
          endpoint: arr_openapiendpoint,
          method: arr_method,
          headernamevalue: arr_headernamevalue,
          headername: arr_headersname,
          headervalue: arr_headersvalue,
          body_data: arr_addpostbody,
          auth_header: authorizationHeader({method: "POST", body: arr_addpostbody, tokens: activatedTokenCache, endpoint: arr_openapiendpoint}),
          requestId: "OpenAPI_" + new Date().getTime().toString(),
          token_desc: activatedTokenCache.desc,
          requestedTime: getCurrentDatetimeUTC()
        }
        
        sendPostReq(obj_request, OnRequestSuccess, OnRequestError, callback);
        showBasicNotification("OPEN API POST Requested", "You will get notified shortly");
        sleep(Math.floor((Math.random() * 1000) + 100), callback);

      }

      if(arr_method == "DELETE"){
        var obj_request = {
          url: activatedTokenCache.baseurl + arr_openapiendpoint,
          endpoint: arr_openapiendpoint,
          method: arr_method,
          auth_header: authorizationHeader({method: "DELETE", tokens: activatedTokenCache, endpoint: arr_openapiendpoint}),
          requestId: "OpenAPI_" + new Date().getTime().toString(),
          token_desc: activatedTokenCache.desc,
          requestedTime: getCurrentDatetimeUTC()
        }
        sendDeleteReq(obj_request, OnRequestSuccess, OnRequestError, callback);
        showBasicNotification("OPEN API POST Requested", "You will get notified shortly");
        sleep(Math.floor((Math.random() * 1000) + 100), callback);

      }


  }
  
