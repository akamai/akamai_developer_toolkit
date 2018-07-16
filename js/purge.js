//Ricky Yu owns this page, please do comment out the section you edit or added so he is aware of the changes

var img_success = "img/success_icon.png",
  img_fail = "img/fail_icon.png",
  img_info = "img/info_icon.jpg";

function updateActiveToken(token) {
  chrome.storage.local.set({'active_token': token}, function(){
    console.log('Active Token Updated: ' + token.uniqid);
  });
}

function showBasicNotification(requestId, title, message, force, img = img_info) {
  var history_key = "H_" + requestId;

  chrome.storage.local.get([history_key, 'notification'], function(data){
    var history = data[history_key];
    var notification_switch = data['notification'];
    var token_desc = "";

    if (notification_switch || force) {
      if (history != null && typeof history != 'undefined') {
        token_desc = history.token_used.desc;
        if (token_desc != "") {
          title = token_desc + ": " + title;
        }
      }

      chrome.notifications.create(requestId, {
        type: "basic",
        iconUrl: img,
        title: title,
        message: message
      });
    }
  });
}

function saveHistory(purge_result) {
  var purge_type = '--';
  var purge_progress = 'Unknown';
  var purgeId = 'Unknown';

  if (purge_result.accepted == 'success') {
    purge_type = (purge_result.response.estimatedSeconds == 5) ? 'v3' : 'v2';
    purge_progress = (purge_type == 'v2') ? 'In-Progress' : 'No-Status';
    purgeId = purge_result.response.purgeId;
  }

  var history_data = { 
    'requestedTime': purge_result.requestedTime,
    'lastupdated': getCurrentDatetimeUTC(),
    'purge_request_accepted': purge_result.accepted,
    'purge_progress': purge_progress,
    'purge_type': purge_type,
    'purgeId': purgeId,
    'network': purge_result.network,
    'urls': purge_result.request_urls,
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
    items: display_items
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
}


function onPurgeError(purge_result) {
  var accepted = "";
  var title = "";

  try {
    purge_result['response'] = JSON.parse(purge_result.xhr.responseText);
    var accepted = "fail";
    var title = "Purge Failed";
  } catch (err) {
    purge_result['response'] = {detail: 'Could not make API call'};
    var accepted = "connect-fail";
    var title = "Request Failed";
  }

  purge_result['accepted'] = accepted;
  purge_result['requestedTime'] = getCurrentDatetimeUTC(); 
  showListNotification(title, purge_result);
}

function makePurgeRequest(arr_urls, network, callback) {
  chrome.storage.local.get(['active_token', 'update_type'], function(data) { 
    var update_type = data['update_type'];
    var active_token = $.extend({}, data['active_token']); 
    var original_token = data['active_token'];

    if (jQuery.isEmptyObject(active_token)) {
      showBasicNotification('noactivetoken', 'No Active Token', 'Please activate a credential', true, img_fail);
      callback("fail");
      return false;
    }

    var urlparser = document.createElement('a');
    urlparser.href = active_token['baseurl'];
    active_token['baseurl'] = urlparser.origin + '/ccu/v3/' + update_type + '/url/' + network;

    var body_data = postBody(arr_urls);

    var auth_header = authorizationHeader({
      method: "POST",
      body: body_data,
      tokens: active_token
    });

    var requestId = "Purge_r" + new Date().getTime().toString();

    $.ajax({
      url: active_token['baseurl'],
      contentType: "application/json",
      type: 'POST',
      data: body_data,
      headers: { 'Authorization': auth_header },
      success: function(response, status, xhr) { 
        onPurgeSuccess({
          xhr: xhr,
          status: status,
          response: response,
          request_urls: arr_urls,
          network: network,
          token: original_token,
          update_type: update_type,
          requestId: requestId
        });
      },
      error: function(xhr, status, error) {
        onPurgeError({
          xhr: xhr,
          status: status,
          request_urls: arr_urls,
          network: network,
          token: original_token,
          update_type: update_type,
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

