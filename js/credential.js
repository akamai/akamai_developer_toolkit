$(document).ready(function(){
  $('select').material_select();
  $('.initialized').hide(); //materialize bug

  chrome.runtime.getBackgroundPage(function (backgroundpage){
    backgroundpage._gaq.push(['_trackEvent', 'Add_new_credentials_page', 'loaded']);
  });

  var apiTokenIds = ['credential_desc', 'baseurl', 'accesstoken', 'clienttoken', 'secret', 'tokentype'];
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
      $('select').material_select();
    });
  }

  $('#submitButton').click(function() {
    chrome.runtime.getBackgroundPage(function (backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'New_credentials_page_save_btn', 'clicked']);
    });

    var desc = $("#credential_desc").val().trim();
    var baseurl = $("#baseurl").val().trim();
    var accesstoken = $("#accesstoken").val().trim();
    var clienttoken = $("#clienttoken").val().trim();
    var secret = $("#secret").val().trim();
    var tokentype = $("#tokentype").val();

    for (var i=0; i < apiTokenIds.length; i++) {
      var obj_input = $('#'+apiTokenIds[i]);
      if (obj_input.val() != null) {
        var user_input_text = obj_input.val().trim().replace(/\s+/g, '');
      } else {
        var user_input_text = obj_input.val();
      }
      if (user_input_text == null || user_input_text == "") {
        switch(apiTokenIds[i]) {
          case 'credential_desc':
            alert('Please enter Credential Description');
            obj_input.focus();
            break;
          case 'baseurl':
            alert('Please enter Base URL');
            obj_input.focus();
            break;
          case 'accesstoken':
            alert('Please enter Access Token');
            obj_input.focus();
            break;
          case 'clienttoken':
            alert('Please enter Client Token');
            obj_input.focus();
            break;
          case 'secret':
            alert('Please enter Client Secret');
            obj_input.focus();
            break;
          case 'tokentype':
            alert('Please select Credential Type');
            obj_input.focus();
            break;
          default:
        }
        return false;
      }
    }

    var urlparser = document.createElement('a');
    urlparser.href = baseurl;
    if (urlparser.protocol !== 'https:') {
      alert('Base URL should start with https://');
      $("#baseurl").focus();
      return false;
    }

    var token_data = {
      'desc': desc,
      'baseurl': baseurl,
      'accesstoken': accesstoken,
      'clienttoken': clienttoken,
      'secret': secret,
      'tokentype': tokentype,
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
        chrome.runtime.getBackgroundPage(function (backgroundpage){
          backgroundpage._gaq.push(['_trackEvent', 'New_credentials_page_save_successful', 'yes']);
        });
        closeCurrentTab();
      });
    });
  });

  $('#clearButton').click(function() {
    chrome.runtime.getBackgroundPage(function (backgroundpage){
      backgroundpage._gaq.push(['_trackEvent', 'New_credentials_page_reset_btn', 'clicked']);
    });

    for (var i=0; i < apiTokenIds.length; i++) {
      obj_input = $('#'+apiTokenIds[i]).val(null);
    }

    Materialize.updateTextFields();
    $('select').material_select();
  });
});
