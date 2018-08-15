var activatedTokenCache = {};

var initCmanagerStorageState = function() {
  console.log("initializing Cmanager Storage");
  chrome.storage.local.get("active_token", function(result) {
    if(result['active_token'] == undefined) {
      activatedTokenCache = {};
      chrome.storage.local.set({'active_token': ""});
    } else {
      var active_token = b(result['active_token']);
      if(active_token) {
        activatedTokenCache = active_token;
      }
    } 
  });
  chrome.storage.local.get("tokens", function(result) {
    if(result['tokens'] == undefined) {
      chrome.storage.local.set({'tokens': []});
    }
  });
}

var updateActiveToken = function(token) {
  var en_token = a(token);
  chrome.storage.local.get("active_token", function(data) {
    if (data['active_token'] != "") {
      var active_token = b(data['active_token']);
      if (active_token && active_token.uniqid != token.uniqid) {
        if (en_token) {
          chrome.storage.local.set({'active_token': en_token}, function() {
            activatedTokenCache = token;
            console.log('Active Token, Cache Updated: ' + token.desc);
          });
        }
      }
    } else {
      if (en_token) {
        chrome.storage.local.set({'active_token': en_token}, function() {
          activatedTokenCache = token;
          console.log('Active Token, Cache Updated: ' + token.desc);
        });
      }
    }
  });
}

var downloadToken = function(objToken) {
  var body = "";
  var field_names = {
    baseurl: "host",
    clienttoken: "client_token",
    accesstoken: "access_token",
    secret: "client_secret",
    desc: "credential_desc",
    tokentype: "credential_type"
  };
  for (var each in field_names) {
    if (each === "baseurl") {
      var url = objToken[each].replace('https://', '');
      body += field_names[each] + " = " + url + "\n\n";
    } else {
      body += field_names[each] + " = " + objToken[each] + "\n\n";
    }
  }
  var filename = objToken.desc.replace(/\s+/g, '-');
  var atag = document.createElement('a');
  atag.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(body));
  atag.setAttribute('download', filename);
  atag.style.display = 'none';
  document.body.appendChild(atag);
  atag.click();
  document.body.removeChild(atag);
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === "cmanager") {
    var token_id = message.token_id;
      switch(message.action) {
        case "delete":
          chrome.storage.local.get(['tokens'], function(data) {
            var arr_tokens = data['tokens'];
            var token_index_to_delete;
            // for the case when decryption failed. token_id is index of token list
            var num_token_id = parseInt(token_id);
            if (num_token_id < 1000) {
              token_index_to_delete = num_token_id;
            } else {
              for (var i=0; i < arr_tokens.length; i++) {
                var de_token = b(arr_tokens[i]);
                if (de_token.uniqid == token_id) {
                  token_index_to_delete = i;
                }
                // delete token == current active token
                if (!jQuery.isEmptyObject(activatedTokenCache)) {
                  if (token_id == activatedTokenCache.uniqid) {
                    activatedTokenCache = {};
                    chrome.storage.local.set({'active_token': ""});
                  }
                }
              }
            }
            if (typeof token_index_to_delete == 'number') {
              arr_tokens.splice(token_index_to_delete, 1);
              if (arr_tokens.length == 0){
                chrome.storage.local.set({
                  'active_token': "",
                  'tokens': []
                });
              } else {
                chrome.storage.local.set({'tokens': arr_tokens});
              }
            }
          });
        break;
      case "activate":
        chrome.storage.local.get('tokens', function(tokens) {
          var arr_tokens = tokens['tokens'];
          for (var i = 0; i < arr_tokens.length; i++) {
            var de_token = b(arr_tokens[i]);
            if (de_token) {
              if (de_token.uniqid == token_id) {
                updateActiveToken(de_token);
                break;
              }
            }
          }
        });
        break;
      case "download":
        chrome.storage.local.get('tokens', function(tokens) {
          var arr_tokens = tokens['tokens'];
          for (var i = 0; i < arr_tokens.length; i++) {
            var de_token = b(arr_tokens[i]);
            if (de_token) {
              if (de_token.uniqid == token_id) {
                downloadToken(de_token);
                break;
              }
            }
          }
        });
        break;
      case "deleteall":
        activatedTokenCache = {};
        chrome.storage.local.set({
          'active_token': "",
          'tokens': []
        });
        break;
      default:
        break;
    }
  }
});
