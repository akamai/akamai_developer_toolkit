var akamai_debug_headers = [
  "akamai-x-cache-on",
  "akamai-x-cache-remote-on",
  "akamai-x-check-cacheable",
  "akamai-x-get-cache-key",
  "akamai-x-get-true-cache-key",
  "akamai-x-get-request-id",
  "akamai-x-get-brotli-status",
  "akamai-x-serial-no",
  "akamai-x-get-ssl-client-session-id",
  "akamai-x-get-client-id"
].join(",");

var img_success = "img/success_icon.png", 
    img_fail = "img/fail_icon.png", 
    img_info = "img/info_icon.png";

//var recoveredFromIdleS = {};
//chrome.idle.setDetectionInterval(300);

//extension needs to be restarted when going idle, it's impacting OPEN API tester's ability to compute the right time parameters
/*chrome.idle.onStateChanged.addListener(function(state) {
      if (state == 'active') {
          console.log('State is now active');
          chrome.storage.local.set({'recoveredFromIdle': 'true'}, function(){
            chrome.runtime.reload();
          })

      }
  });*/


var showBasicNotification = function(title, message, img = img_info) {
  chrome.notifications.create(getCurrentDatetimeUTC(), {
    type: "basic",
    iconUrl: img,
    title: title,
    message: message
  });
}

//open popup.html as a separate window every time a user clicks on the ext icon
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup"
  });
});


var showListNotification = function(type, title, obj_result, img = img_info) {
  var display_items = [{title: '', message: ''}];
  var context_msg = "";

  if (type == 'purge') {
    title = obj_result.token_used + ": " + title;
    context_msg = "Purge Type: " + obj_result.purge_type.toUpperCase();
    display_items = [{title: 'Result', message: 'Click here to see result'}];
  } else if (type == "debug-errorcode") {
    title = obj_result.token_desc + ": " + title;
    context_msg = obj_result.errorcode;
    display_items = [{title: 'Result', message: 'Click here to see result'}];
  } else if (type == 'debug-fetchlog') {
    title = obj_result.token_desc + ": " + title;
    context_msg = obj_result.hostname + ' logs from ' + obj_result.ipaddr;
    display_items = [{title: 'Result', message: 'Click here to see result'}];
  } else if (type == 'OpenAPI') {
    title = obj_result.token_desc + ": " + title;
    context_msg = 'OPEN API Request';
    display_items = [{title: 'Result', message: 'Click here to see result'}];
  } 

  chrome.notifications.create(obj_result.requestId, {
    type: "list",
    iconUrl: img,
    title: title,
    message: "",
    contextMessage: context_msg,
    items: display_items
  }); 
}

var checkActiveCredential = function(credential_type_needed) {
  if (jQuery.isEmptyObject(activatedTokenCache)) {
    chrome.runtime.sendMessage({
      msg: "cred_mismatch_nocreds", 
      data: {
          subject: "nocreds",
          content: "nocred"
      }
  });
    showBasicNotification('No Active Token', 'Please activate a credential', img_fail);
    return false;
  } else {
    var credential_type = "";
    switch(credential_type_needed) {
      case "luna":
        credential_type = "General OPEN APIs";
        break;
      case "purge":
        credential_type = "Fast Purge APIs";
        break;
      default:
        break;
    }
    if (activatedTokenCache.tokentype !== credential_type) {
      chrome.runtime.sendMessage({
        msg: "cred_mismatch_nocreds", 
        data: {
            subject: "mistmatch_creds",
            content: "mismatch"
        }
    });
      showBasicNotification('Credential Type Mismatch', 'Activate ' + credential_type + ' credential', img_fail);
      return false;
    } else {
      return true;
    }
  } 
}

// Fires when Chrome starts or when user clicks refresh button in extension page
chrome.runtime.onStartup.addListener(function() {
  initFastPurgeStorage();
  initDebugReqStorage();
  initStorageTemp(); 
  initCmanagerStorageState();
  initOpenAPIStorage();
});

// Fires when user clicks disable / enable button in extension page
window.onload = function() {
  initFastPurgeStorage();
  initDebugReqStorage();
  initStorageTemp(); 
  initCmanagerStorageState();
  initOpenAPIStorage();
};

// restart app when new update is available 
chrome.runtime.onUpdateAvailable.addListener(function(details) {
  console.log("updating to version " + details.version);
  chrome.runtime.reload();
});

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install'){
    chrome.storage.local.set({'firstTime': 'true'}, function(){
      console.log('firsttimeuser value is set to true' );
    });
  }
  if (details.reason === 'update'){
    chrome.storage.local.get('recoveredFromIdle', function(recoveredFromIdleS) {
      recoveredFromIdleS = recoveredFromIdleS['recoveredFromIdle'];
      if (recoveredFromIdleS !== 'true') {
        chrome.storage.local.set({'updatedU': 'true'}, function(){
          console.log('updated value is set to true' );
        })
      }
      else {
        chrome.storage.local.set({'recoveredFromIdle':'false'}, function(){
          console.log('setting recoveredFromIdle from back to false, so that we show the updated notification in case of refresh');
        })
      }

    });
  }
  else {
    chrome.storage.local.set({'updatedU': 'false'});
    //chrome.storage.local.set({'firstTime': 'false'});
    console.log('else loop is exectued');
  }
  initFastPurgeStorage();
  initDebugReqStorage();
  initStorageTemp();
  initCmanagerStorageState();
  initOpenAPIStorage();
});


//code for Context Menus
chrome.contextMenus.create({
  "id": "akamaidevtoolkit",
  "title": "Purge this URL", 
  "contexts":["all"]
});
chrome.contextMenus.create({
  "id": "akamaidevtoolkitchild1",
  "title": "Purge Staging Network", 
  "parentId": "akamaidevtoolkit",
  "contexts":["all"]
});
chrome.contextMenus.create({
  "id": "akamaidevtoolkitchild2",
  "title": "Purge Production Network", 
  "parentId": "akamaidevtoolkit",
  "contexts":["all"]
});

chrome.contextMenus.onClicked.addListener(function(event){
  var network = "staging";
  var currentUrl = event.frameUrl || event.pageUrl;
  if (currentUrl != null) {
    switch (event.menuItemId) {
      case "akamaidevtoolkitchild1":
        network = "staging";
        break;
      case "akamaidevtoolkitchild2":
        network = "production";
        break;
      default:
        network = "staging";
        break;
    }
  } else {
    alert("URL does not exist");
    return false;
  }

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs.length) {
      var tab = tabs[0];
      chrome.tabs.executeScript(tab.id, {file: "js/jquery-3.1.1.min.js"}, function() {
        chrome.tabs.executeScript(tab.id, {file: "js/HoldOn.min.js"}, function() {
          chrome.tabs.executeScript(tab.id, {file: "js/modal.js"}, function() {
            chrome.tabs.sendMessage(tab.id, {action: "open"}, function(response) {
              makePurgeRequest([currentUrl], network, function(){
                chrome.tabs.sendMessage(tab.id, {action: "close"});
              });
            });
          });
        });
      });
    }
  });
});

chrome.notifications.onClicked.addListener(function(event){
  if(event.startsWith("Debug")){
    chrome.tabs.create({url: 'debugreq/debugreq-history.html?id=' + event});
  }
  if(event.startsWith("Purge")){
    chrome.tabs.create({url: 'fastpurge/fastpurge-history.html?id=' + event});
  }
  if(event.startsWith("OpenAPI")){
    chrome.tabs.create({url: 'openapitester/openapitester-history.html?id=' + event});
  }
  chrome.notifications.clear(event);
});

// Proxy
/*chrome.webRequest.onAuthRequired.addListener(
  function(details, callbackFn) {
    if(details.isProxy === false){
      callbackFn();
      return;
    }
    chrome.storage.local.get('lastProfileId', function(lastProfileIdObj){
      var lastProfileId = lastProfileIdObj['lastProfileId'];
      chrome.storage.local.get(lastProfileId, function(profileDataObj){
        var profileData = profileDataObj[lastProfileId];
        var paras = profileData.split('|');
        callbackFn({
            authCredentials: {username: paras[4], password: paras[5]}
        });
      });
    });
  }, {urls: ["<all_urls>"]}, ['asyncBlocking']
);
*/

// This is Temporary. will be removed in next version
var initStorageTemp = function() {
  chrome.storage.sync.clear();

  // for credential (active, tokens) encryption
  chrome.storage.local.get(['active_token', 'tokens'], function(data) {
    var active_token = data['active_token'];
    var arr_tokens = data['tokens'];
    if (active_token != undefined || active_token != null) {
      if (typeof active_token == "object")  {
        var encrypted = a(active_token);
        console.log("Active token encrpyted");
        chrome.storage.local.set({'active_token': encrypted});
      }
    }

    let flag = 0;
    if (arr_tokens != undefined || arr_tokens != null) {
      for(var i=0; i < arr_tokens.length; i++) {
        if (typeof arr_tokens[i] == "object") {
          var encrypt = a(arr_tokens[i]);
          arr_tokens[i] = encrypt;
          flag = 1;
        }
      }
    }
    if (flag === 1) {
      console.log("Token list encrpyted");
      chrome.storage.local.set({'tokens': arr_tokens});
    }
  });

  // for fastpurge records migration - temporary
  chrome.storage.local.get(null, function(data) {
    var arr_history = [];
    var arr_history_keys = [];
    for (var key in data) {
      if (key.startsWith("H_")) {
        arr_history.push(data[key]);
        arr_history_keys.push(key);
      }
    }
    if (arr_history_keys.length > 0) {
      chrome.storage.local.remove(arr_history_keys, function(){
        console.log("Removed old format purge records");
      });
    }
    if (arr_history.length > 0) {
      chrome.storage.local.get('purgeHistory', function(purgedata) { 
        var obj_records = purgedata['purgeHistory']; 
        for (var i=0; i < arr_history.length; i++) {
          var key = arr_history[i].requestId;
          obj_records[key] = arr_history[i];
        }
        chrome.storage.local.set({ purgeHistory: obj_records }, function() {
          console.log("Purge records migrated to purgeHistory");
        });
      });
    }
  });

  // for D_Debug records - temporary
  chrome.storage.local.get(null, function(data) {
    var arr_history_keys = [];
    for (var key in data) {
      if (key.startsWith("D_")) {
        arr_history_keys.push(key);
      }
    }
    if (arr_history_keys.length > 0) {
      chrome.storage.local.remove(arr_history_keys, function(){
        console.log("Removed old format debugreq records");
      });
    }
  });
}