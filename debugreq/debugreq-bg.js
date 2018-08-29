var initDebugReqStorage = function() {
  console.log("initializing DebugReq Storage");
  chrome.storage.local.get(['translateErrorCodeHistory', 'fetchLogByIpHistory'], function(result) {
    if(result['translateErrorCodeHistory'] == undefined) {
      chrome.storage.local.set({'translateErrorCodeHistory': {}});
    }  
    if(result['fetchLogByIpHistory'] == undefined) {
      chrome.storage.local.set({'fetchLogByIpHistory': {}});
    }  
  });
}

function translateErrorCode(errorcode, callback) {
  if(!checkActiveCredential("luna")) {
    callback();
    return;
  }
  var reference_code = errorcode.replace('#','');
  var endpoint = getApiEndPoint("debug-translate-errorcode", {errorcode: reference_code});
  var obj_request = {
    url: activatedTokenCache.baseurl + endpoint,
    auth_header: authorizationHeader({method: "GET", tokens: activatedTokenCache, endpoint: endpoint}),
    requestId: "DebugErrCode" + new Date().getTime().toString(),
    token_desc: activatedTokenCache.desc,
    errorcode: reference_code,
    requestedTime: getCurrentDatetimeUTC()
  }
  sendGetReq(obj_request, onTranslateSuccess, onTranslateError);
  showBasicNotification("ErrorCode Translatation Requested", "You will get notified shortly");
  sleep(Math.floor((Math.random() * 1000) + 100), callback);
}

function getLogLinesFromIP(obj_debug_data, callback) {
  if(!checkActiveCredential("luna")) {
    callback();
    return;
  }
  var querystring = "?endTime=" + encodeURIComponent(getCurrentDatetimeUTC("ISO-8601")) + "&hostHeader=" + obj_debug_data.hostname;
  var endpoint = getApiEndPoint("debug-fetchlog-by-ip", {ipaddr: obj_debug_data.ipaddr, querystring: querystring});
  var obj_request = {
    url: activatedTokenCache.baseurl + endpoint,
    auth_header: authorizationHeader({method: "GET", tokens: activatedTokenCache, endpoint: endpoint}),
    requestId: "DebugFetchLog" + new Date().getTime().toString(),
    ipaddr: obj_debug_data.ipaddr,
    hostname: obj_debug_data.hostname,
    token_desc: activatedTokenCache.desc,
    requestedTime: getCurrentDatetimeUTC()
  }
  sendGetReq(obj_request, onGetLogLinesSuccess, onGetLogLinesError);
  showBasicNotification("Fetching Logs Requested", "You will get notified shortly");
  sleep(Math.floor((Math.random() * 1000) + 100), callback);
}

var onTranslateSuccess = function(response, status, obj_request) {
  var translate_result = {
    'lastupdated': getCurrentDatetimeUTC(),
    'requestedTime': obj_request.requestedTime,
    'raw_response': response,
    'token_desc': obj_request.token_desc,
    'requestId': obj_request.requestId,
    'errorcode': obj_request.errorcode,
    'status': 'success',
    'debug_type': 'errorcode'
  };
  saveDebugReqResult(translate_result);
  showListNotification("debug-errorcode", "ErrorCode Translation Success", translate_result, img_success);
}

var onTranslateError = function(xhr, status, error, obj_request) {
  var translate_result = {
    'lastupdated': getCurrentDatetimeUTC(),
    'requestedTime': obj_request.requestedTime,
    'raw_response': '',
    'token_desc': obj_request.token_desc,
    'requestId': obj_request.requestId,
    'errorcode': obj_request.errorcode,
    'status': 'fail',
    'debug_type': 'errorcode'
  };
  try {
    translate_result['raw_response'] = JSON.parse(xhr.responseText);
  } catch (err) {
    translate_result['raw_response'] = {detail: 'Could not make API request'};
  }
  saveDebugReqResult(translate_result);
  showListNotification("debug-errorcode", "ErrorCode Translation Failed", translate_result, img_fail);
}

var onGetLogLinesSuccess = function(response, status, obj_request) {
  var getlogline_result = {
    'lastupdated': getCurrentDatetimeUTC(),
    'requestedTime': obj_request.requestedTime,
    'raw_response': response,
    'token_desc': obj_request.token_desc,
    'requestId': obj_request.requestId,
    'ipaddr': obj_request.ipaddr,
    'hostname': obj_request.hostname,
    'status': 'success',
    'debug_type': 'fetchlog'
  };
  saveDebugReqResult(getlogline_result);
  showListNotification("debug-fetchlog", "Fetch Log Success", getlogline_result, img_success);
}

var onGetLogLinesError = function(xhr, status, error, obj_request) { 
  var getlogline_result = {
    'lastupdated': getCurrentDatetimeUTC(),
    'requestedTime': obj_request.requestedTime,
    'raw_response': '',
    'token_desc': obj_request.token_desc,
    'requestId': obj_request.requestId,
    'ipaddr': obj_request.ipaddr,
    'hostname': obj_request.hostname,
    'status': 'fail',
    'debug_type': 'fetchlog'
  };
  try {
    getlogline_result['raw_response'] = JSON.parse(xhr.responseText);
  } catch (err) {
    getlogline_result['raw_response'] = {detail: 'Could not make API request'};
  }
  saveDebugReqResult(getlogline_result);
  showListNotification("debug-fetchlog", "Fetch Log Failed", getlogline_result, img_fail);
}

function saveDebugReqResult(result) {
  if (result.debug_type == 'errorcode') {
    chrome.storage.local.get('translateErrorCodeHistory', function(records) {
      var translate_history = records['translateErrorCodeHistory'];
      translate_history[result.requestId] = result;
      chrome.storage.local.set({ translateErrorCodeHistory: translate_history });
      console.log("New " + result.debug_type + " record added");
    });
  }
  if (result.debug_type == 'fetchlog') {
    chrome.storage.local.get('fetchLogByIpHistory', function(records) {
      var fetchlog_history = records['fetchLogByIpHistory'];
      fetchlog_history[result.requestId] = result;
      chrome.storage.local.set({ fetchLogByIpHistory: fetchlog_history });
      console.log("New " + result.debug_type + " record added");
    });
  }
}
