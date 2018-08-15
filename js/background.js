var akamai_debug_headers = [
  "akamai-x-cache-on",
  "akamai-x-cache-remote-on",
  "akamai-x-check-cacheable",
  "akamai-x-get-cache-key",
  "akamai-x-get-true-cache-key",
  "akamai-x-get-extracted-values",
  "akamai-x-get-request-id",
  "akamai-x-serial-no",
  "akamai-x-get-ssl-client-session-id",
  "akamai-x-get-client-id"
].join(",");

var img_success = "img/success_icon.png", 
    img_fail = "img/fail_icon.png", 
    img_info = "img/info_icon.jpg";

// Fires when Chrome starts or when user clicks refresh button in extension page
chrome.runtime.onStartup.addListener(function() {
  initFastPurgeStorage();
  initStorageTemp(); 
  initPiezStorageState();
  initDebugHeaderSwitchState();
  initCmanagerStorageState();
});

// Fires when user clicks disable / enable button in extension page
window.onload = function() {
  initFastPurgeStorage();
  initStorageTemp(); 
  initPiezStorageState();
  initDebugHeaderSwitchState();
  initCmanagerStorageState();
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
    chrome.storage.local.set({'updatedU': 'true'}, function(){
      console.log('updated value is set to true' );
    })
  }
  initFastPurgeStorage();
  initStorageTemp(); 
  initPiezStorageState();
  initDebugHeaderSwitchState();
  initCmanagerStorageState();
});

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
  if (event.srcUrl != null) {
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
    chrome.tabs.executeScript(tabs[0].id, {file: "js/jquery-3.1.1.min.js"}, function() {
      chrome.tabs.executeScript(tabs[0].id, {file: "js/HoldOn.min.js"}, function() {
        chrome.tabs.executeScript(tabs[0].id, {file: "js/modal.js"}, function() {
          chrome.tabs.sendMessage(tabs[0].id, {action: "open"}, function(response) {
            makePurgeRequest([event.srcUrl], network, function(){
              chrome.tabs.sendMessage(tabs[0].id, {action: "close"});
            });
          });
        });
      });
    });
  });
});

chrome.notifications.onClicked.addListener(function(event){
  if(event.startsWith("Debug_r")){
    chrome.tabs.create({url: 'debugreq/debugreq-details.html?id=' + event});
  }
  if(event.startsWith("Purge")){
    chrome.tabs.create({url: 'fastpurge/fastpurge-history.html?id=' + event});
  }
  chrome.notifications.clear(event);
});

// Proxy
chrome.webRequest.onAuthRequired.addListener(
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
}
