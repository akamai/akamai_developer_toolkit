
var initOPENAPIStorage = function() {
  console.log("initializing OPEN API request response Storage");
  chrome.storage.local.get(['openapiHistory'], function(result) {
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
    console.log(openapi_history[openapi_result.requestId]);
    console.log("New OPEN API request record added");
  });
}

var onRequestSuccess = function(response, status, obj_request) {
    _gaq.push(['_trackEvent', 'OPENAPI_req_successful', 'yes']);
    var openapi_result = {
      'lastupdated': getCurrentDatetimeUTC(),
      'requestedTime': obj_request.requestedTime,
      'openapi_request_accepted': 'success',
      'openapi_endpoint': obj_request.openapiendpoint,
      'raw_response': response,
      'token_used': obj_request.token_desc,
      'requestId': obj_request.requestId,
      'response_code': status,
      'request_payload': obj_request.body_data
    };
    saveOpenAPIResult(openapi_result);
    showListNotification("openapi", "Request Success", openapi_result, img_success);
  }
  
  var onRequestError = function(xhr, status, error, obj_request) {
    _gaq.push(['_trackEvent', 'OPENAPI_req_not_successful', 'yes']);
    var openapi_result = {
      'lastupdated': getCurrentDatetimeUTC(),
      'requestedTime': obj_request.requestedTime,
      'openapi_request_accepted': 'no errors found',
      'openapi_endpoint': obj_request.openapiendpoint,
      'raw_response': '',
      'token_used': obj_request.token_desc,
      'requestId': obj_request.requestId,
      'response_code': status,
      'request_payload': obj_request.body_data
    };
    var title = "";
    try {
      openapi_result['raw_response'] = JSON.parse(xhr.responseText);
      openapi_result['openapi_request_accepted'] = "fail";
      var title = "OPEN API Request Failed";
      _gaq.push(['_trackEvent', 'OpenAPI_req_failure_reason', 'Request_Failed']);
    } catch (err) {
      openapi_result['raw_response'] = {detail: 'Could not make API call'};
      openapi_result['openapi_request_accepted'] = "connect-fail";
      var title = "Connect Fail";
      _gaq.push(['_trackEvent', 'OpenAPI_req_failure_reason', 'Connection Failed']);
    }
    saveOpenAPIResult(openapi_result);
    showListNotification("openapi", title, openapi_result, img_fail);
  }
  
 

  function makeOPENAPIReqs(arr_openapiendpoint, arr_method, arr_addpostbody, callback) {
    if(!checkActiveCredential("luna")) {
      callback();
      return;
    }
    console.log(arr_method);
    console.log(arr_openapiendpoint);
    //console.log(arr_headername);
    //console.log(arr_headervalue);
    console.log(arr_addpostbody);
    var active_token = jQuery.extend(true, {}, activatedTokenCache);
    var openapi_requests = [];
    chrome.runtime.sendMessage({type: "gaq", target: "setting_apiendpoint", behavior: "processed"});
    active_token.baseurl += arr_openapiendpoint; 
   //active_token.baseurl = urlparser.toLocaleString() + arr_openapiendpoint;
    var body1_data = arr_addpostbody.replace(/\n|\r/g,"");
     openapi_requests.push({
        baseurl: active_token.baseurl,
        body_data: body1_data,
        auth_header: authorizationHeader({method: "POST", body: body1_data, tokens: active_token}),
        requestId: "OPENAPI_r" + new Date().getTime().toString(),
        token_desc: active_token.desc,
        requestedTime: getCurrentDatetimeUTC(),
        openapiendpoint: arr_openapiendpoint
      });
    
  
    if (openapi_requests.length > 0) {
      for (i=0; i < openapi_requests.length; i++) {
        sendPostReq(openapi_requests[i], onRequestSuccess, onRequestError, callback);
      }
    } else {
      showBasicNotification('Input Error', 'Please check if API endpoint exists', img_fail);
      callback("fail");
      return false;
    }
  }