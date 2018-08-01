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
    console.log("setting debugheader switch to: "+type);
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
      // console.log('Unexpected extension request. ', request);
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
  console.log("setting piez - "+state);
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
