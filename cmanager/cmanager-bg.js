var updateActiveToken = function(token) {
  chrome.storage.local.set({'active_token': token}, function(){
    console.log('Active Token Updated: ' + token.desc);
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
        chrome.storage.local.get(['tokens', 'active_token'], function(data) {
          var arr_tokens = data['tokens'];
          var active_token = data['active_token'];
          var token_index_to_delete = 0;
          for (var i = 0; i < arr_tokens.length; i++) {
            if (arr_tokens[i].uniqid == token_id) {
              token_index_to_delete = i;
            }
            // delete token == current active token
            if (active_token != null || typeof active_token != 'undefined') {
              if (token_id == active_token.uniqid) {
                chrome.storage.local.remove('active_token');
              }
            }
          }
          arr_tokens.splice(token_index_to_delete, 1);
          chrome.storage.local.set({
            'tokens': arr_tokens
          });
        });
        break;
      case "activate":
        chrome.storage.local.get('tokens', function(tokens) {
          var arr_tokens = tokens['tokens'];
          for (var i = 0; i < arr_tokens.length; i++) {
            if (arr_tokens[i].uniqid == token_id) {
              updateActiveToken(arr_tokens[i]);
              break;
            }
          }
        });
        break;
      case "download":
        chrome.storage.local.get('tokens', function(tokens) {
          var arr_tokens = tokens['tokens'];
          for (var i = 0; i < arr_tokens.length; i++) {
            if (arr_tokens[i].uniqid == token_id) {
              downloadToken(arr_tokens[i]);
              break;
            }
          }
        });
        break;
      case "deleteall":
        chrome.storage.local.remove(['tokens', 'active_token']);
        break;
      default:
        break;
    }
  }
});
