/*
 * Adding google analytics to track only clicks within the extension, 
 * this will help us improve services that are most used, feel free to email ajayapra@akamai.com in case 
 * you would like to get a non-analytics version of our extension
 * Source https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/tutorials/analytics/popup.js
 */

// dev analytics tracker 
var _AnalyticsCode = 'UA-116652320-3';

var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

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

// piez settings
var inspectedTab = {};
var devtools_port;
var piezCurrentStateOptions = { 
  'piez-im-simple': {
    'browserActionText': 'IM',
    'localStorageState': 'piez-im-simple'
  },
   'piez-im-advanced': {
    'browserActionText': 'IM+',
    'localStorageState': 'piez-im-advanced'
  },
  'piez-a2': {
    'browserActionText': 'PP',
    'localStorageState': 'piez-a2'
  },
  'piez-ro-simple': {
     'browserActionText': 'RO',
     'localStorageState': 'piez-ro-simple'
  },
  'piez-ro-advanced': {
     'browserActionText': 'RO+',
     'localStorageState': 'piez-ro-advanced'
  },
  'piez-3pm': {
     'browserActionText': 'SM',
     'localStorageState': 'piez-3pm'
  },
  'piez-off': {
     'browserActionText': 'Off',
     'localStorageState': 'piez-off'
  }
};

var piezCurrentStateCached = '';
var akamaiDebugHeaderSwitchStateCached = '';

var initDebugHeaderSwitchState = function() {
  chrome.storage.local.get('akamaiDebugHeaderSwitch', function(data) {
    var type = data['akamaiDebugHeaderSwitch'];
    if (typeof type == 'undefined' || type == null) {
      chrome.storage.local.set({akamaiDebugHeaderSwitch: 'OFF'}, function(){
        akamaiDebugHeaderSwitchStateCached = 'OFF';
      });
    } else {
      akamaiDebugHeaderSwitchStateCached = type;
    }
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "browser-akamaidebugheaderswitch") {
    chrome.storage.local.set({akamaiDebugHeaderSwitch: request.body}, function() {
      console.log("akamai-debug-header-switch: "+request.body);
      akamaiDebugHeaderSwitchStateCached = request.body;
    });
  }
});

beforeSendCallback = function(details) {
  if(/^[^:]*:(?:\/\/)?(?:[^\/]*\.)?akamaiapis.net\/.*$/.test(details.url) || /^https:\/\/ac\.akamai\.com\/.*/.test(details.url)) {
    return;
  }
  if (akamaiDebugHeaderSwitchStateCached === 'ON' && details.url.indexOf('http') != -1) {
    switch(piezCurrentStateCached) {
      case "piez-off":
        details.requestHeaders.push({name: 'pragma', value: akamai_debug_headers});
        break;
      case "piez-a2":
        details.requestHeaders.push({name: 'pragma', value: akamai_debug_headers});
        details.requestHeaders.push({name: 'x-akamai-rua-debug', value: 'on'});
        break;
      default:
        details.requestHeaders.push({name: 'pragma', value: akamai_debug_headers + ',akamai-x-ro-trace'});
        details.requestHeaders.push({name: 'x-im-piez', value: 'on'});
        details.requestHeaders.push({name: 'x-akamai-ro-piez', value: 'on'});
        details.requestHeaders.push({name: 'x-akamai-a2-disable', value: 'on'});
        break;
    }
  } else if (akamaiDebugHeaderSwitchStateCached === 'OFF' && details.url.indexOf('http') != -1) {
      switch(piezCurrentStateCached) {
        case "piez-off":
          break;
        case "piez-a2":
          details.requestHeaders.push({name: 'pragma', value: 'x-akamai-a2-trace'});
          details.requestHeaders.push({name: 'x-akamai-rua-debug', value: 'on'});
          break;
        default:
          details.requestHeaders.push({name: 'x-im-piez', value: 'on'});
          details.requestHeaders.push({name: 'pragma', value: 'akamai-x-ro-trace'});
          details.requestHeaders.push({name: 'x-akamai-ro-piez', value: 'on'});
          details.requestHeaders.push({name: 'x-akamai-a2-disable', value: 'on'});
          break;
      }
  } else {
    // 
  }
  return {requestHeaders: details.requestHeaders};
};

// Piez - get the URL that the tab is navigating to
chrome.webNavigation.onBeforeNavigate.addListener(function beforeNavigate(details) {
  if (details.tabId === inspectedTab.id && details.frameId === 0) {
    inspectedTab.url = details.url;
  }
});

// Piez - get the actual url to use if there's a redirect for the base page
chrome.webRequest.onBeforeRedirect.addListener(function getNewUrl(redirect) {
  var urlMatch = new RegExp('(' + inspectedTab.url + '|' + inspectedTab.url + '/)', 'i');
  if (redirect.tabId === inspectedTab.id && redirect.frameId === 0 && urlMatch.test(redirect.url)) {
    var newLocation = redirect.responseHeaders.find(function(header) {
      return /location/i.test(header.name);
    });
    if (newLocation !== undefined) {
      inspectedTab.url = newLocation.value;
    }
  }
}, {urls: ["<all_urls>"]}, ['responseHeaders']);

// Piez
chrome.runtime.onConnect.addListener(function(port) {
  console.log ('testing');
  devtools_port = port;
  port.onMessage.addListener(function onMessageListener (message) {
    switch (message.type) {
      case "inspectedTab":
        inspectedTab.id = message.tab;
        break;
      case "a2PageLoad":
        chrome.webNavigation.onCompleted.addListener(function pageComplete(details) {
          if (details.tabId === inspectedTab.id && details.frameId === 0) {
            try {
              port.postMessage({type:'a2PageLoaded'});
            }
            finally {
              chrome.webNavigation.onCompleted.removeListener(pageComplete);
            }
          }
        });
        break;
      case "update-piez-analytics":
        chrome.tabs.getSelected(null, function(tab) {
          logUrlAnalytics(tab);
        });
        break;
      default:
        console.log('Unexpected message from devtools. ', message);
    }
  });
  port.onDisconnect.addListener(function() { //stop keeping track since our devtools closed
    devtools_port = undefined;
    inspectedTab = {};
  });
});

// Piez
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('piez - here we go');
  switch (request.type) {
    case "piez-off":
      setPiezCurrentState('piez-off');
      break;
    case "piez-im-simple":
      setPiezCurrentState('piez-im-simple');
      break;
    case "piez-im-advanced":
      setPiezCurrentState('piez-im-advanced');
      break;
    case "piez-a2":
      setPiezCurrentState('piez-a2');
      break;
    case "piez-ro-simple":
      setPiezCurrentState('piez-ro-simple');
      break;
    case "piez-ro-advanced":
      setPiezCurrentState('piez-ro-advanced');
      break;
    case "piez-3pm":
      setPiezCurrentState('piez-3pm');
      break;
    default:
      console.log('Unexpected extension request. ', request);
      break;
  }
  return false;
});

// Piez
var getCookiesUrl = function(href) {
  var link = document.createElement("a");
  link.href = href;
  return(link.protocol + "//" + link.hostname);
};

// Piez
var setPiezCurrentState = function(state) {
  if(state == 'piez-off') {
    chrome.storage.local.set({"piezCurrentState": state}, function() {
      piezCurrentStateCached = state;
      //chrome.browserAction.setBadgeText({"text": piezCurrentStateOptions[state]["browserActionText"]});
      //chrome.browserAction.setBadgeBackgroundColor({"color": [44, 146, 3, 255]});
      chrome.browserAction.setBadgeText({text: ''});
      //chrome.webRequest.onBeforeSendHeaders.removeListener(beforeSendCallback);
      chrome.webRequest.onBeforeSendHeaders.addListener(beforeSendCallback, {urls: [ "<all_urls>" ]}, ['requestHeaders','blocking']);
    });
  } else {
    chrome.storage.local.set({"piezCurrentState": state}, function() {
      piezCurrentStateCached = state;
      chrome.browserAction.setBadgeText({"text": piezCurrentStateOptions[state]["browserActionText"]});
      chrome.browserAction.setBadgeBackgroundColor({"color": [44, 146, 3, 255]});
      if (!chrome.webRequest.onBeforeSendHeaders.hasListener(beforeSendCallback)) {
        chrome.webRequest.onBeforeSendHeaders.addListener(beforeSendCallback, {urls: [ "<all_urls>" ]}, ['requestHeaders','blocking']);
      }
    });
  }
}

var initPiezStorageState = function() {
  chrome.storage.local.get("piezCurrentState", function(result) {
    if (result["piezCurrentState"] == undefined) {
      setPiezCurrentState('piez-im-simple');
    } else {
      key = result["piezCurrentState"];
      if (piezCurrentStateOptions[key] == undefined) {
        setPiezCurrentState('piez-im-simple');
      } else {
        console.log("Setting state to: " + key)
        setPiezCurrentState(key);
      }
    }
  });
}

var logUrlAnalytics = function(tab) {
  // (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  // (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  // m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  // })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  //
  // ga('create', 'UA-62551710-2', 'auto');
  // ga('set', 'checkProtocolTask', function(){});
  // ga('require', 'displayfeatures');
  // ga('send', 'pageview', tab.url);
};

chrome.runtime.onStartup.addListener(function() {
  initPiezStorageState();
  initDebugHeaderSwitchState();
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

// restart app when new update is available 
chrome.runtime.onUpdateAvailable.addListener(function(details) {
  console.log("updating to version " + details.version);
  chrome.runtime.reload();
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
    chrome.tabs.create({url: 'debugdetails.html?id=' + event});
  }
  if(event.startsWith("Purge")){
    chrome.tabs.create({url: 'purgedetails.html?id=' + event});
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


