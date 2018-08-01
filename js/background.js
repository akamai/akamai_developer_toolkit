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

// Fires when Chrome starts or when user clicks refresh button in extension page
chrome.runtime.onStartup.addListener(function() {
  initPiezStorageState();
  initDebugHeaderSwitchState();
});

// Fires when user clicks disable / enable button in extension page
window.onload = function() {
  initPiezStorageState();
  initDebugHeaderSwitchState();
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

  initPiezStorageState();
  initDebugHeaderSwitchState();

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
    chrome.tabs.create({url: 'fastpurge/fastpurge-details.html?id=' + event});
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

//trying out a different way to proxy request https requests
/*var host = "https://www.akamaidevops.com.edgekey-staging.net";
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
         return {redirectUrl: host + details.url.match(/^https?:\/\/[^\/]+([\S\s]*)/)[1]};
    },
    {
        urls: [
            "*://akamaidevops.com/*",
            "*://www.akamaidevops.com/*"
        ],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    },
    ["blocking"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    for (var i = 0; i < details.requestHeaders.length; ++i) {
      var flag=true;
      if (details.requestHeaders[i].name === 'Host') {
        details.requestHeaders.splice(i, 1);
        flag=false;
        break;
      } 
  if (flag) details.requestHeaders.push({"name":"Host","value":"www.akamaidevops.com"});
    }
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["*://www.akamaidevops.com.edgekey-staging.net/*"]},
  ["blocking", "requestHeaders"]);
*/
/* commenting this section out since we rely on Piez pragma header addition to push headers into the request
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    //console.log("enabled is :" + enabled);
    if(enabled){
      var pragma_exists = false
      for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'Pragma') {
          details.requestHeaders[i].value = details.requestHeaders[i].value.concat(", ",debug_headers)
          pragma_exists = true
         // console.log("pragma" + pragma_exists);
          break;
        }
      }
      if(!pragma_exists) {
        details.requestHeaders.push(akamai_header)
        //console.log("Akamai headers added to: " + details.url);
      }
    } else {
      //console.log("I am in the else loop" + enabled);
      var pragma_exists = false
      for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'Pragma') {
          details.requestHeaders.splice(i, 1);
          //console.log("Pragma removed: " + details.url);
          break;
        }
      }
      if(!pragma_exists) {
        //details.requestHeaders.push(non_akamai_header)
        //console.log("do nothing: " + details.url);
      }
    }
    return {requestHeaders: details.requestHeaders};
  }, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]
);
*/


