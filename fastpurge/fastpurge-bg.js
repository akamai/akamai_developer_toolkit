//Ricky Yu owns this page, please do comment out the section you edit or added so he is aware of the changes
var img_success = "img/success_icon.png",
  img_fail = "img/fail_icon.png",
  img_info = "img/info_icon.jpg";

function showBasicNotification(title, message, img = img_info) {
  chrome.notifications.create(getCurrentDatetimeUTC(), {
    type: "basic",
    iconUrl: img,
    title: title,
    message: message
  });
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
  var save_obj = {};
  var key = 'H_' + purge_result.requestId;
  save_obj[key] = history_data;
  chrome.storage.local.set(save_obj);
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
  chrome.storage.local.get(['active_token', 'update_type'], function(data) { 
    var update_type = data['update_type'];
    var active_token = b(data['active_token']); 
    var token_info = { desc: active_token.desc };

    if (jQuery.isEmptyObject(active_token)) {
      showBasicNotification('No Active Token', 'Please activate a credential', img_fail);
      callback("fail");
      return false;
    }

    if (active_token.tokentype !== "Fast Purge APIs") {
      showBasicNotification('Credential Type Mismatch', 'Please activate Fast Purge credential', img_fail);
      callback("fail");
      return false;
    }

    var obj_purge_targets = inputParser(arr_purge_targets);
    var purge_requests = [];
    var urlparser = document.createElement('a');
    urlparser.href = active_token['baseurl'];

    if (obj_purge_targets.urls.length > 0) {
      active_token.baseurl = urlparser.origin + '/ccu/v3/' + update_type + '/url/' + network; 
      purge_requests.push({
        baseurl: active_token.baseurl,
        body_data: postBody(obj_purge_targets.urls),
        auth_header: authorizationHeader({method: "POST", body: postBody(obj_purge_targets.urls), tokens: active_token}),
        purge_type: 'url',
        requestId: "PurgeURL_r" + new Date().getTime().toString()
      });
    } 
    
    if (obj_purge_targets.cpcodes.length > 0) {
      active_token.baseurl = urlparser.origin + '/ccu/v3/' + update_type + '/cpcode/' + network; 
      purge_requests.push({
        baseurl: active_token.baseurl,
        body_data: postBody(obj_purge_targets.cpcodes),
        auth_header: authorizationHeader({method: "POST", body: postBody(obj_purge_targets.cpcodes), tokens: active_token}),
        purge_type: 'cpcode',
        requestId: "PurgeCPCode_r" + new Date().getTime().toString()
      });
    } 
    
    if (obj_purge_targets.tags.length > 0) {
      active_token.baseurl = urlparser.origin + '/ccu/v3/' + update_type + '/tag/' + network; 
      purge_requests.push({
        baseurl: active_token.baseurl,
        body_data: postBody(obj_purge_targets.tags),
        auth_header: authorizationHeader({method: "POST", body: postBody(obj_purge_targets.tags), tokens: active_token}),
        purge_type: 'tag',
        requestId: "PurgeTag_r" + new Date().getTime().toString()
      });
    }

    if (purge_requests.length > 0) {
      for (i=0; i < purge_requests.length; i++) {
        sendPurgeRequest(purge_requests[i], network, update_type, token_info, callback);
      }
    } else {
      showBasicNotification('Input Error', 'Please check entered purge targets are correct', img_fail);
      callback("fail");
      return false;
    }
  });
}

function sendPurgeRequest(obj_request, network, update_type, token_info, callback) {
  $.ajax({
    url: obj_request.baseurl,
    contentType: "application/json",
    type: 'POST',
    data: obj_request.body_data,
    headers: { 'Authorization': obj_request.auth_header },
    success: function(response, status, xhr) { 
      onPurgeSuccess({
        xhr: xhr,
        status: status,
        response: response,
        request_objects: JSON.parse(obj_request.body_data).objects,
        network: network,
        token: token_info,
        update_type: update_type,
        requestId: obj_request.requestId,
        purge_type: obj_request.purge_type
      });
    },
    error: function(xhr, status, error) {
      onPurgeError({
        xhr: xhr,
        status: status,
        request_objects: JSON.parse(obj_request.body_data).objects,
        network: network,
        token: token_info,
        update_type: update_type,
        requestId: obj_request.requestId,
        purge_type: obj_request.purge_type
      }); 
    },
    complete: function (xhr, status) {
      if (typeof callback != 'undefined') {
        callback(status);
      }
    }
  });
}
