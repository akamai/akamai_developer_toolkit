<<<<<<< HEAD

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
    //console.log(openapi_history[openapi_result.requestId]);
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
=======
//Ricky Yu owns this page, please do comment out the section you edit or added so he is aware of the changes
var initFastPurgeStorage = function() {
    console.log("initializing FastPurge Storage");
    chrome.storage.local.get("purgeHistory", function(result) {
      if(result['purgeHistory'] == undefined) {
        chrome.storage.local.set({'purgeHistory': {}});
      }  
    });
>>>>>>> parent of 0fe69d2... adding support to test OPEN APIs
  }
  
  function saveHistory(purge_result) {
    var purgeId = 'Unknown';
    var history_data = { 
      'requestedTime': purge_result.requestedTime,
      'lastupdated': getCurrentDatetimeUTC(),
      'purge_request_accepted': purge_result.accepted,
      'purge_type': purge_result.purge_type,
      'purgeId': purge_result.response.purgeId,
      'network': purge_result.network,
      'purge_objects': purge_result.request_objects,
      'raw_response': purge_result.response,
      'token_used': purge_result.token,
      'update_type': purge_result.update_type,
      'requestId': purge_result.requestId
    };
    chrome.storage.local.get('purgeHistory', function(records) {
      var purge_history = records['purgeHistory'];
      purge_history[history_data.requestId] = history_data;  
      chrome.storage.local.set({ purgeHistory: purge_history });
      console.log("New purge record added");
    });
  }
  
  function showListNotification(title, purge_result) {
    switch (purge_result.accepted) {
      case "success":
        icon_url = img_success;
        break;
      case "fail":
        icon_url = img_fail;
        break;
      case "connect-fail":
        icon_url = img_fail;
        break;
      default:
        icon_url = img_info;
        break;
    }
  
    var obj_raw_response = purge_result.response;
    var display_items = [];
  
    display_fields = ['httpStatus', 'purgeId', 'detail', 'estimatedSeconds', 'title'];
    for(var key in obj_raw_response) {
      if (display_fields.indexOf(key) >= 0) {
        each_item = {title: key.capitalize(), message: obj_raw_response[key].toString()};
        display_items.push(each_item);
      }
    }
    
    chrome.notifications.create(purge_result.requestId, {
      type: "list",
      iconUrl: icon_url,
      title: purge_result.token.desc + ": " + title,
      message: "",
      items: display_items,
      contextMessage: purge_result.purge_type.toUpperCase() + " Purge" + " - " + purge_result.accepted.capitalize()
    }, function() {
      if (purge_result.accepted != 'connect-fail') { 
        saveHistory(purge_result); 
      } 
    }); 
  }
  
  function onPurgeSuccess(purge_result) {
    purge_result['accepted'] = "success";
    purge_result['requestedTime'] = getCurrentDatetimeUTC(); 
    showListNotification("Purge Success", purge_result);
    _gaq.push(['_trackEvent', 'Purge_req_successful', 'yes']);
  
  }
  
  function onPurgeError(purge_result) {
    _gaq.push(['_trackEvent', 'Purge_req_successful', 'no']);
  
    var accepted = "";
    var title = "";
    try {
      purge_result['response'] = JSON.parse(purge_result.xhr.responseText);
      var accepted = "fail";
      var title = "Purge Failed";
      _gaq.push(['_trackEvent', 'Purge_req_failure_reason', 'Purge_failed']);
    } catch (err) {
      purge_result['response'] = {detail: 'Could not make API call'};
      var accepted = "connect-fail";
      var title = "Request Failed";
      _gaq.push(['_trackEvent', 'Purge_req_failure_reason', 'Request Failed']);
    }
    purge_result['accepted'] = accepted;
    purge_result['requestedTime'] = getCurrentDatetimeUTC(); 
    showListNotification(title, purge_result);
  }
  
<<<<<<< HEAD
 

  function makeOPENAPIReqs(arr_openapiendpoint, arr_method, arr_addpostbody) {
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
    //var getopenapi_requests = [];
    chrome.runtime.sendMessage({type: "gaq", target: "setting_apiendpoint", behavior: "processed"});
    active_token.baseurl += arr_openapiendpoint; 
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
          sendPostReq(openapi_requests[i], onRequestSuccess, onRequestError);
        }
      } else {
        showBasicNotification('Input Error', 'Please check if API endpoint exists', img_fail);
        callback("fail");
        return false;
      }
    
  }
=======
  function inputParser(arr_purge_targets) {
    var urlchecker = document.createElement('a');
    var re_cpcode = /^\d\d\d\d\d\d$/g;
    var arr_urls = [], arr_cpcodes = [], arr_tags = [];
  
    for(var i=0; i < arr_purge_targets.length; i++) {
      urlchecker.href = arr_purge_targets[i];
      if (urlchecker.protocol == "http:" || urlchecker.protocol == "https:") {
        arr_urls.push(arr_purge_targets[i]);   
      } else if (arr_purge_targets[i].match(re_cpcode) != null) {
        arr_cpcodes.push(arr_purge_targets[i]);
      } else {
        arr_tags.push(arr_purge_targets[i]);
      }
    }
  
    var purge_targets = { 
      urls: arr_urls,
      cpcodes: arr_cpcodes,
      tags: arr_tags,
    };
  
    return purge_targets;
  }
  
  function makeOpenAPIReq(arr_openapiendpoint, arr_method, arr_headername, arr_headervalue, arr_addpostbody, callback) {
      console.log(arr_method);
      console.log(arr_openapiendpoint);
      console.log(arr_headername);
      console.log(arr_headervalue);
      console.log(arr_addpostbody);

    chrome.storage.local.get('update_type', function(data) { 
        var update_type = data['update_type'];
        var active_token = jQuery.extend(true, {}, activatedTokenCache);
        var original_token = { desc: active_token.desc };
        var timestamp_debug = getTimeStampInUtcUrlencoded();
  
    
        if (jQuery.isEmptyObject(active_token)) {
          showBasicNotification('No Active Token', 'Please activate a credential', img_fail);
          callback("fail");
          return false;
        }
  
        if (active_token.tokentype !== "General OPEN APIs") {
          showBasicNotification('Credential Type Mismatch', 'Please activate General OPEN APIs credential', img_fail);
          callback("fail");
          return false;
        }
    
        var urlparser = document.createElement('a');
        urlparser = active_token['baseurl'];
  
        chrome.runtime.sendMessage({type: "gaq", target: "setting_apiendpoint", behavior: "processed"});
        active_token['baseurl'] = urlparser.toLocaleString() + arr_openapiendpoint;
        
       // active_token['baseurl'] = urlparser.toLocaleString() + 'diagnostic-tools/v2/ip-addresses/104.97.15.125/log-lines?endTime=2018-07-16T03%3A01%3A38Z&clientIp=66.31.23.36&duration=30&hostHeader=www.akamaidevops.com&requestId='+ arr_errorrefdata;
        
       // var body_data = postBody(arr_addpostbody);
       // var auth_header = authorizationHeader({method: "POST", body: postBody(obj_purge_targets.urls), tokens: active_token});
    
        var requestId = "OPENAPI_r" + new Date().getTime().toString();
        //POST requests section
        if(arr_method == "POST"){
            var body_data = postBody(arr_addpostbody);
            var auth_header = authorizationHeader({method: "POST", body: postBody(arr_addpostbody), tokens: active_token});
            console.log("AJAX fired");
            $.ajax({
                url: active_token['baseurl'],
                contentType: "application/json",
                type: 'POST',
                data: body_data,
                headers: { 'Authorization': auth_header , arr_headername: arr_headervalue },
                success: function(response, status, xhr) { 
                  onDebugSuccess({
                      xhr: xhr,
                      status: status,
                      response: response,
                      token: original_token,
                      PostBody_request: body_data,
                      requestId: requestId,
                    }, arr_ghostIP, arr_errorrefdata);
                },
                error: function(xhr, status, error) {
                  onDebugError({
                    xhr: xhr,
                    status: status,
                    refID: arr_errorrefdata,
                    token: original_token,
                    requestId: requestId
                  }, arr_ghostIP, arr_errorrefdata); 
                },
                complete: function (xhr, status) {
                  if (typeof callback != 'undefined') {
                    callback(status);
                  }
                }
              });
        }
        //GET REQUESTS
        if(arr_method == "GET"){
            var auth_header = authorizationHeader({
                method: "GET",
                tokens: active_token
              });
            console.log("AJAX fired");
            $.ajax({
                url: active_token['baseurl'],
                type: 'GET',
                headers: { 'Authorization': auth_header },
                success: function(response, status, xhr) { 
                  onDebugSuccess({
                      xhr: xhr,
                      status: status,
                      response: response,
                      token: original_token,
                      refID: arr_errorrefdata,
                      requestId: requestId,
                    }, arr_ghostIP, arr_errorrefdata);
                },
                error: function(xhr, status, error) {
                  onDebugError({
                    xhr: xhr,
                    status: status,
                    refID: arr_errorrefdata,
                    token: original_token,
                    requestId: requestId
                  }, arr_ghostIP, arr_errorrefdata); 
                },
                complete: function (xhr, status) {
                  if (typeof callback != 'undefined') {
                    callback(status);
                  }
                }
              });
        }
    
      });
  }
  
>>>>>>> parent of 0fe69d2... adding support to test OPEN APIs
