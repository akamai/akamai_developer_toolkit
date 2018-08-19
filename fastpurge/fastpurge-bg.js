var purgeUpdateTypeCache = "";

var initFastPurgeStorage = function() {
  console.log("initializing FastPurge Storage");
  chrome.storage.local.get(["purgeHistory", "update_type"], function(result) {
    if(result['purgeHistory'] == undefined) {
      chrome.storage.local.set({'purgeHistory': {}});
    }  
    if(result['update_type'] == undefined) {
      chrome.storage.local.set({update_type: 'invalidate'}, function() {
        purgeUpdateTypeCache = 'invalidate';
      });
    } else {
      purgeUpdateTypeCache = result['update_type'];
    }
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type == "fastpurge") {
    if (message.update_type != undefined)
    chrome.storage.local.set({'update_type': message.update_type}, function() {
      purgeUpdateTypeCache = message.update_type;
      console.log("Fastpurge: update_type was updated to " + message.update_type);
    });
  }
});

function createPostBody(arr_objects) {
  post_data = { 'objects': new Array() };
  for(var i=0; i < arr_objects.length; i++) {
    post_data['objects'].push(arr_objects[i]);
  }
  return JSON.stringify(post_data);
}

function savePurgeResult(purge_result) {
  chrome.storage.local.get('purgeHistory', function(records) {
    var purge_history = records['purgeHistory'];
    purge_history[purge_result.requestId] = purge_result;  
    chrome.storage.local.set({ purgeHistory: purge_history });
    console.log("New purge record added");
  });
}

function showListNotification(title, purge_result) {
  switch (purge_result.purge_request_accepted) {
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
  var obj_raw_response = purge_result.raw_response;
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
    title: purge_result.token_used + ": " + title,
    message: "",
    items: display_items,
    contextMessage: purge_result.purge_type.toUpperCase() + " Purge" + " - " + purge_result.purge_request_accepted.capitalize()
  }); 
}

var onPurgeSuccess = function(response, status, obj_request) {
  _gaq.push(['_trackEvent', 'Purge_req_successful', 'yes']);
  var purge_result = {
    'lastupdated': getCurrentDatetimeUTC(),
    'requestedTime': obj_request.requestedTime,
    'purge_request_accepted': 'success',
    'purge_type': obj_request.purge_type,
    'purgeId': response.purgeId,
    'network': obj_request.purge_network,
    'purge_objects': JSON.parse(obj_request.body_data).objects,
    'raw_response': response,
    'token_used': obj_request.token_desc,
    'update_type': obj_request.purge_update_type,
    'requestId': obj_request.requestId
  };
  savePurgeResult(purge_result);
  showListNotification("Purge Success", purge_result);
}

var onPurgeError = function(xhr, status, error, obj_request) {
  _gaq.push(['_trackEvent', 'Purge_req_successful', 'no']);
  var purge_result = {
    'lastupdated': getCurrentDatetimeUTC(),
    'requestedTime': obj_request.requestedTime,
    'purge_request_accepted': '',
    'purge_type': obj_request.purge_type,
    'purgeId': 'Purge Request Error',
    'network': obj_request.purge_network,
    'purge_objects': JSON.parse(obj_request.body_data).objects,
    'raw_response': '',
    'token_used': obj_request.token_desc,
    'update_type': obj_request.purge_update_type,
    'requestId': obj_request.requestId
  };
  var title = "";
  try {
    purge_result['raw_response'] = JSON.parse(xhr.responseText);
    purge_result['purge_request_accepted'] = "fail";
    var title = "Purge Failed";
    _gaq.push(['_trackEvent', 'Purge_req_failure_reason', 'Purge_failed']);
  } catch (err) {
    purge_result['raw_response'] = {detail: 'Could not make API call'};
    purge_result['purge_request_accepted'] = "connect-fail";
    var title = "Request Failed";
    _gaq.push(['_trackEvent', 'Purge_req_failure_reason', 'Request Failed']);
  }
  savePurgeResult(purge_result);
  showListNotification(title, purge_result);
}

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

function makePurgeRequest(arr_purge_targets, network, callback) {
  if (jQuery.isEmptyObject(activatedTokenCache)) {
    showBasicNotification('No Active Token', 'Please activate a credential', img_fail);
    callback("fail");
    return false;
  } else if (activatedTokenCache.tokentype !== "Fast Purge APIs") {
    showBasicNotification('Credential Type Mismatch', 'Please activate Fast Purge credential', img_fail);
    callback("fail");
    return false;
  }

  var active_token = jQuery.extend(true, {}, activatedTokenCache);
  var obj_purge_targets = inputParser(arr_purge_targets);
  var purge_requests = [];
  var urlparser = document.createElement('a');
  urlparser.href = active_token['baseurl'];

  if (obj_purge_targets.urls.length > 0) {
    active_token.baseurl = urlparser.origin + '/ccu/v3/' + purgeUpdateTypeCache + '/url/' + network; 
    purge_requests.push({
      baseurl: active_token.baseurl,
      body_data: createPostBody(obj_purge_targets.urls),
      auth_header: authorizationHeader({method: "POST", body: createPostBody(obj_purge_targets.urls), tokens: active_token}),
      purge_type: 'url',
      requestId: "PurgeURL_r" + new Date().getTime().toString(),
      purge_update_type: purgeUpdateTypeCache,
      token_desc: active_token.desc,
      purge_network: network,
      requestedTime: getCurrentDatetimeUTC()
    });
  } 
  
  if (obj_purge_targets.cpcodes.length > 0) {
    active_token.baseurl = urlparser.origin + '/ccu/v3/' + purgeUpdateTypeCache + '/cpcode/' + network; 
    purge_requests.push({
      baseurl: active_token.baseurl,
      body_data: createPostBody(obj_purge_targets.cpcodes),
      auth_header: authorizationHeader({method: "POST", body: createPostBody(obj_purge_targets.cpcodes), tokens: active_token}),
      purge_type: 'cpcode',
      requestId: "PurgeCPCode_r" + new Date().getTime().toString(),
      purge_update_type: purgeUpdateTypeCache,
      token_desc: active_token.desc,
      purge_network: network,
      requestedTime: getCurrentDatetimeUTC()
    });
  } 
  
  if (obj_purge_targets.tags.length > 0) {
    active_token.baseurl = urlparser.origin + '/ccu/v3/' + purgeUpdateTypeCache + '/tag/' + network; 
    purge_requests.push({
      baseurl: active_token.baseurl,
      body_data: createPostBody(obj_purge_targets.tags),
      auth_header: authorizationHeader({method: "POST", body: createPostBody(obj_purge_targets.tags), tokens: active_token}),
      purge_type: 'tag',
      requestId: "PurgeTag_r" + new Date().getTime().toString(),
      purge_update_type: purgeUpdateTypeCache,
      token_desc: active_token.desc,
      purge_network: network,
      requestedTime: getCurrentDatetimeUTC()
    });
  }

  if (purge_requests.length > 0) {
    for (i=0; i < purge_requests.length; i++) {
      sendPostReq(purge_requests[i], onPurgeSuccess, onPurgeError, callback);
    }
  } else {
    showBasicNotification('Input Error', 'Please check entered purge targets are correct', img_fail);
    callback("fail");
    return false;
  }
}
