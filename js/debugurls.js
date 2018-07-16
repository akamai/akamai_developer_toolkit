


function saveDebugHistory(debug_result) {
    var debug_type = '--';
    var debug_progress = 'Unknown';
    var debugId = 'Unknown';
  
    if (debug_result.accepted == 'success') {
      debug_type = 'v2';
      debug_progress = (debug_type == 'v3') ? 'In-Progress' : 'No-Status';
      debugId = debug_result.requestedTime;
    }
  
    var history_data = { 
      'requestedTime': debug_result.requestedTime,
      'lastupdated': getCurrentDatetimeUTC(),
      'reason_for_failure': debug_result.response.translatedError.reasonForFailure,
      'error_response_code': debug_result.response.translatedError.httpResponseCode,
      'serverIp': debug_result.response.translatedError.serverIp,
      'refID': debug_result.refID,
      'requesturl': debug_result.response.translatedError.url,
     // 'pruge_type': debug_type,
     // 'purgeId': debugId,
     // 'network': purge_result.network,
     // 'Ref Error Code': debug_result.httpResponseCode,
      'raw_response': debug_result.response.translatedError,
      'token_used': debug_result.token,
      //'update_type': purge_result.update_type,
      'requestId': debug_result.requestId
    };
  
    var save_obj = {};
    var key = 'D_' + debug_result.requestId;
    save_obj[key] = history_data;
  
    chrome.storage.local.set(save_obj, function(data){
      if (debug_result.accepted == 'success' && debug_type == 'v3') {
        //createPurgeStatusChecker(purge_result);
      } 
    });
  }

  function saveDebugHistory_logs(debug_result) {
    var debug_type = '--';
    var debug_progress = 'Unknown';
    var debugId = 'Unknown';
  
    if (debug_result.accepted == 'success') {
      debug_type = 'v2';
      debug_progress = (debug_type == 'v3') ? 'In-Progress' : 'No-Status';
      debugId = debug_result.requestedTime;
    }
  
    var history_data = { 
      'requestedTime': debug_result.requestedTime,
      'lastupdated': getCurrentDatetimeUTC(),
      'reason_for_failure': 'click to see the raw logs',
      //'error_response_code': debug_result.response.translatedError.httpResponseCode,
      //'serverIp': debug_result.response.translatedError.serverIp,
      //'refID': debug_result.refID,
     // 'requesturl': debug_result.response.translatedError.url,
     // 'pruge_type': debug_type,
     // 'purgeId': debugId,
     // 'network': purge_result.network,
     // 'Ref Error Code': debug_result.httpResponseCode,
      'raw_response': debug_result.response.loglines,
      'token_used': debug_result.token,
      //'update_type': purge_result.update_type,
      'requestId': debug_result.requestId
    };
  
    var save_obj = {};
    var key = 'D_' + debug_result.requestId;
    save_obj[key] = history_data;
  
    chrome.storage.local.set(save_obj, function(data){
      if (debug_result.accepted == 'success' && debug_type == 'v3') {
        //createPurgeStatusChecker(purge_result);
      } 
    });
  }

  function saveDebugHistoryerror(debug_result) {
    var debug_type = '--';
    var debug_progress = 'Unknown';
    var debugId = 'Unknown';
  
    if (debug_result.accepted == 'success') {
      debug_type = 'v2';
      debug_progress = (debug_type == 'v3') ? 'In-Progress' : 'No-Status';
      debugId = debug_result.requestedTime;
    }
  
    var history_data = { 
      'requestedTime': debug_result.requestedTime,
      'lastupdated': getCurrentDatetimeUTC(),
      //'reason_for_failure': debug_result.response.translatedError.reasonForFailure,
      //'error_response_code': debug_result.response.translatedError.httpResponseCode,
      //'serverIp': debug_result.response.translatedError.serverIp,
      'refID': debug_result.refID,
      //'status': debug_result.response.status,
     // 'errortitle': debug_result.response.title,
     // 'pruge_type': debug_type,
     // 'purgeId': debugId,
     // 'network': purge_result.network,
     // 'Ref Error Code': debug_result.httpResponseCode,
      'raw_response': debug_result.response,
      'token_used': debug_result.token,
      //'update_type': purge_result.update_type,
      'requestId': debug_result.requestId
    };
  
    var save_obj = {};
    var key = 'D_' + debug_result.requestId;
    save_obj[key] = history_data;
  
    chrome.storage.local.set(save_obj, function(data){
      if (debug_result.accepted == 'success' && debug_type == 'v3') {
        //createPurgeStatusChecker(purge_result);
      } 
    });
  }


  function saveDebugHistoryerror_logs(debug_result) {
    var debug_type = '--';
    var debug_progress = 'Unknown';
    var debugId = 'Unknown';

  
    var history_data = { 
      'requestedTime': debug_result.requestedTime,
      'lastupdated': getCurrentDatetimeUTC(),
      'reason_for_failure': 'click to see the raw logs',
      //'error_response_code': debug_result.response.translatedError.httpResponseCode,
      //'serverIp': debug_result.response.translatedError.serverIp,
      //'refID': debug_result.refID,
      //'status': debug_result.response.status,
     // 'errortitle': debug_result.response.title,
     // 'pruge_type': debug_type,
     // 'purgeId': debugId,
     // 'network': purge_result.network,
     // 'Ref Error Code': debug_result.httpResponseCode,
      'raw_response': debug_result.response,
      'token_used': debug_result.token,
      //'update_type': purge_result.update_type,
      'requestId': debug_result.requestId
    };
  
    var save_obj = {};
    var key = 'D_' + debug_result.requestId;
    save_obj[key] = history_data;
  
    chrome.storage.local.set(save_obj, function(data){
      if (debug_result.accepted == 'success' && debug_type == 'v3') {
        //createPurgeStatusChecker(purge_result);
      } 
    });
  }
  
function onDebugSuccess(debug_result) {
    //console.log ("onDebugSuccess is run")
    debug_result['accepted'] = "success";
    debug_result['requestedTime'] = getCurrentDatetimeUTC(); 
    //console.log ('req-id = ' + debug_result.response.translatedError.url)
    showListNotificationdebug("Debug Request Successful", debug_result);
}
  

  function onDebugError(debug_result) {
    var accepted = "";
    var title = "";
   // console.log ("error is run")
    try {
      debug_result['response'] = JSON.parse(debug_result.xhr.responseText);
      var accepted = "fail";
      var title = "Translation Failed";
     // console.log ("response error" + debug_result.response)
    } catch (err) {
      //debug_result['response'] = {detail: 'Could not make API call, please enter a valid error ref ID'};
      debug_result['response'] = JSON.parse(debug_result.xhr.responseText)
      var accepted = "connect-fail";
      var title = "Request Failed";
    }
  
    debug_result['accepted'] = accepted;
    debug_result['requestedTime'] = getCurrentDatetimeUTC(); 
    showListNotificationdebugerror(title, debug_result);
  }


function makeErrorRefReq(arr_errorrefdata, arr_ghostIP, callback) {
    chrome.storage.local.get(['active_token', 'update_type'], function(data) { 
      var update_type = data['update_type'];
      var active_token = $.extend({}, data['active_token']); 
      var original_token = data['active_token'];
      var timestamp_debug = getTimeStampInUtcUrlencoded();

  
      if (jQuery.isEmptyObject(active_token)) {
        showBasicNotification('noactivetoken', 'No Active Token', 'Please activate a credential', true, img_fail);
        callback("fail");
        return false;
      }
  
      var urlparser = document.createElement('a');
      urlparser = active_token['baseurl'];

      //set endtime for 

      if (jQuery.isEmptyObject(arr_ghostIP)){
        console.log ('arr_ghostIP');
        active_token['baseurl'] = urlparser.toLocaleString() + 'diagnostic-tools/v2/errors/' + arr_errorrefdata + '/translated-error';
      }
      else {
        active_token['baseurl'] = urlparser.toLocaleString() + 'diagnostic-tools/v2/ip-addresses/' + arr_ghostIP + '/log-lines?endTime=' + timestamp_debug + '&hostHeader='+ arr_errorrefdata;
    
      }
     // active_token['baseurl'] = urlparser.toLocaleString() + 'diagnostic-tools/v2/ip-addresses/104.97.15.125/log-lines?endTime=2018-07-16T03%3A01%3A38Z&clientIp=66.31.23.36&duration=30&hostHeader=www.akamaidevops.com&requestId='+ arr_errorrefdata;
      
      //var body_data = postBody(arr_urls);
  
      var auth_header = authorizationHeader({
        method: "GET",
        tokens: active_token
      });
  
      var requestId = "Debug_r" + new Date().getTime().toString();
  
      $.ajax({
        url: active_token['baseurl'],
        //contentType: "application/json",
        type: 'GET',
        //data: body_data,
        headers: { 'Authorization': auth_header },
        success: function(response, status, xhr) { 
          onDebugSuccess({
              xhr: xhr,
              status: status,
              response: response,
              token: original_token,
              refID: arr_errorrefdata,
              requestId: requestId
            });
        },
        error: function(xhr, status, error) {
          onDebugError({
            xhr: xhr,
            status: status,
            refID: arr_errorrefdata,
            token: original_token,
            requestId: requestId
          }); 
        },
        complete: function (xhr, status) {
          if (typeof callback != 'undefined') {
            callback(status);
          }
        }
      });
  
    });
}

function showListNotificationdebug(title, debug_result) {

    switch (debug_result.accepted) {
      case "success":
        icon_url = img_success;
       //console.log ("Success Notificationlist is run")
       // console.log (debug_result.requestId)
       // console.log (debug_result.response.translatedError.url)
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
  
    var obj_raw_response = debug_result.response;
    var display_items = [];
    if (debug_result.response.logLines.headers != '0'){
    display_items = ['log fetch successful'];
    }
    else {
      display_fields = ['reasonForFailure', 'title'];
      for(var key in obj_raw_response.translatedError) {
        if (display_fields.indexOf(key) >= 0) {
          each_item = {title: key.capitalize(), message: obj_raw_response.translatedError[key].toString()};
          display_items.push(each_item);
        }
      }
    }

  
    chrome.notifications.create(debug_result.requestId, {
      type: "list",
      iconUrl: icon_url,
      title: title,
      message: "",
      items: display_items
    }, function() {
      if (debug_result.accepted != 'connect-fail') { 
        if (debug_result.response.logLines.headers != '0'){
          saveDebugHistory_logs(debug_result);
        }
        else {
          saveDebugHistory(debug_result); 
        }
       
      } 
    }); 
  
  }

  function showListNotificationdebugerror(title, debug_result) {

    switch (debug_result.accepted) {
      case "success":
        icon_url = img_success;
       // console.log ("Success Notificationlist is run")
       // console.log (debug_result.requestId)
       // console.log (debug_result.response.translatedError.url)
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
  
    var obj_raw_response = debug_result.response;
    var display_items = [];

    display_fields = ['detail', 'title'];
    for(var key in obj_raw_response) {
      if (display_fields.indexOf(key) >= 0) {
        each_item = {title: key.capitalize(), message: obj_raw_response[key].toString()};
        display_items.push(each_item);
      }
    }

  
    chrome.notifications.create(debug_result.requestId, {
      type: "list",
      iconUrl: icon_url,
      title: title,
      message: "",
      items: display_items
    }, function() {
     // if (debug_result.accepted != 'connect-fail') { 
        saveDebugHistoryerror(debug_result); 
     // } 
    }); 
  
  }