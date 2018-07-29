$(document).ready(function(){
  $('select').material_select();
  $('.initialized').hide(); //materialize bug

  chrome.runtime.getBackgroundPage(function (backgroundpage){
    backgroundpage._gaq.push(['_trackEvent', 'Add_new_credentials_page', 'loaded']);
  });

  var credentialType = function(domain) {
    if (domain.match(/.*\.luna\.akamaiapis\.net\/?$/i)) {
      return "luna";
    } else if (domain.match(/.*\.purge\.akamaiapis\.net\/?$/i)) {
      return "purge";
    } else {
      return null;
    }
    return null;
  }

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
            break;
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

    var domainre = /^https:\/\/[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]+\.(?:purge|luna)\.akamaiapis\.net\/?$/i;
    if (!baseurl.match(domainre)) {
      alert('Please check if Base URL is in right format');
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

	$(":file").change(function(){
		var uploaded_file = this.files[0];
    if (!uploaded_file) {
      alert("Failed to load file");
    } else if (!uploaded_file.type.match('text.*')) {
		  alert(uploaded_file.name + " is not a valid text file");
    } else {
      var read = new FileReader();
      read.onload = function(frObj) {
        var f_body = frObj.target.result;
        var arr_fline = f_body.split('\n');
        var split_re = /secret=|host=|token=/i;
        var arr_tokens = [];
        for (var i=0; i < arr_fline.length; i++) {
          var fline_trimed = arr_fline[i].replace(/\s+/g, '');
          if (fline_trimed.match(/.*host.*akamaiapis\.net.*|.*akamaiapis\.net.*host.*/i)) {
            arr_tokens.push({ token_type: "host", token_value: fline_trimed.split(split_re)[1] });
          } else if (fline_trimed.match(/.*client.*secret.*|.*secret.*client.*/i)) {
            arr_tokens.push({ token_type: "client_secret", token_value: fline_trimed.split(split_re)[1] });
          } else if (fline_trimed.match(/.*client.*token.*|.*token.*client.*/i)) { 
            arr_tokens.push({ token_type: "client_token", token_value: fline_trimed.split(split_re)[1] });
          } else if (fline_trimed.match(/.*access.*token.*|.*token.*access.*/i)) {  
            arr_tokens.push({ token_type: "access_token", token_value: fline_trimed.split(split_re)[1] });
          } else {
            //
          }
        }
        for (var i=0; i < arr_tokens.length; i++) {
          switch (arr_tokens[i].token_type) {
            case "host":
              $("#baseurl").val("https://" + arr_tokens[i].token_value);
              $("#baseurl").trigger("change");
              break;
            case "client_secret":
              $("#secret").val(arr_tokens[i].token_value);
              break;
            case "client_token":
              $("#clienttoken").val(arr_tokens[i].token_value);
              break;
            case "access_token":
              $("#accesstoken").val(arr_tokens[i].token_value);
              break;
            default:
              break;
          }
        }
      }
      read.readAsText(uploaded_file);
    }
	});

  $('#baseurl').on("change paste keyup", function() {
    var credential_type = credentialType($(this).val());
    if (credential_type === "purge") {
      $("#tokentype").val("Fast Purge APIs");
      $('select').material_select();
    } else if (credential_type === "luna") {
      $("#tokentype").val("General OPEN APIs");
      $('select').material_select();
    } else {
      $("#tokentype").val(null);
      $('select').material_select();
    }
  });

}); // document ready
