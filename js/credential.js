$(document).ready(function(){

  var apiTokenIds = ['baseurl', 'accesstoken', 'clienttoken', 'secret', 'credential_desc'];
  var passedId = getUrlParameter('id');
  var edit_mode = false;

  if (passedId != '') {
    chrome.storage.local.get('tokens', function(tokens) {
      var arr_tokens = tokens['tokens'];
      var edit_token = "";
      for(var i=0; i < arr_tokens.length; i++) {
        if (arr_tokens[i].uniqid == passedId) {
          edit_token = arr_tokens[i];
          edit_mode = true;
          break;
        }
      }
      for (var i=0; i < apiTokenIds.length; i++) {
        $('#'+apiTokenIds[i]).val(edit_token[apiTokenIds[i]]);
        if (apiTokenIds[i] == 'credential_desc') {
          $('#credential_desc').val(edit_token.desc);
        }
      }
    });
  }

  $('#submitButton').click(function() {

    var desc = $("#credential_desc").val().trim();
    var baseurl = $("#baseurl").val().trim();
    var accesstoken = $("#accesstoken").val().trim();
    var clienttoken = $("#clienttoken").val().trim();
    var secret = $("#secret").val().trim();

    for (var i=0; i < apiTokenIds.length; i++) {
      var obj_input = $('#'+apiTokenIds[i]);
      var user_input_text = obj_input.val().trim().replace(/\s+/g, '');
      if (user_input_text == null || user_input_text == "") {
        alert('Please enter ' + apiTokenIds[i]);
        obj_input.focus();
        return false;
      }
    }

    var token_data = {
      'desc': desc,
      'baseurl': baseurl,
      'accesstoken': accesstoken,
      'clienttoken': clienttoken,
      'secret': secret,
      'uniqid': new Date().getTime().toString()
    }

    // edit mode, update active_token if it was active.
    if (edit_mode) {
      token_data.uniqid = passedId;
      chrome.storage.local.get('active_token', function(data) {
        var active_token = data['active_token'];
        if (active_token.uniqid == passedId) {
          updateActiveToken(token_data);
        }
      });
    }

    chrome.storage.local.get('tokens', function(tokens) {

      var arr_tokens = tokens['tokens'];

      if (typeof arr_tokens != 'undefined' && arr_tokens != 'null') {

        if (edit_mode) {
          for (var i=0; i < arr_tokens.length; i++) {
            if(arr_tokens[i].uniqid == passedId) {
              arr_tokens[i] = token_data;
            }
          }
        } else {
          arr_tokens.unshift(token_data);
        }

      } else {
        arr_tokens = [token_data];
      }

      if (arr_tokens.length > 20) {
        alert("You can only add up to 20 credentials");
        return false;
      }

      chrome.storage.local.set({'tokens': arr_tokens} , function() { 
        alert('Saved Successfully');
        closeCurrentTab();
      });

    });

  });

  $('#clearButton').click(function() {
    for (var i=0; i < apiTokenIds.length; i++) {
      obj_input = $('#'+apiTokenIds[i]).val('');
    }
    Materialize.updateTextFields();
  });

});
