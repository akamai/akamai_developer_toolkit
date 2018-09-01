function loadcredentialaddition(){
  console.log('credential.js loaded');
 // $('select').material_select();
 // $('.initialized').hide(); // materialize bug

  chrome.runtime.sendMessage({type: "gaq", target: "Add_new_credentials_page", behavior: "loaded"});

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
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      chrome.storage.local.get('tokens', function(tokens) {
        var arr_tokens = tokens['tokens'];
        var edit_token = "";
        for(var i=0; i < arr_tokens.length; i++) {
          var de_token = backgroundpage.b(arr_tokens[i]);
          if (de_token) {
            if (de_token.uniqid == passedId) {
              edit_token = de_token;
              edit_mode = true;
              break;
            }
          } else {
            alert("Failed to load the credential");
            return;
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
    });
  }

  $('#submitButton, #submitButton-add').click(function() {
    chrome.runtime.sendMessage({type: "gaq", target: "New_credentials_page_save_btn", behavior: "clicked"});

    var button_id = $(this).attr('id'); 
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

    chrome.runtime.getBackgroundPage(function(backgroundpage) {

      // edit mode, update active_token if it was active.
      if (edit_mode) {
        if (backgroundpage.activatedTokenCache.uniqid == passedId) {
          backgroundpage.updateActiveToken(token_data);
        }
      }

      var en_token_data = backgroundpage.a(token_data);
      if (!en_token_data) {
        alert("Encryption failed. Please try again");
        return false;
      }

			chrome.storage.local.get('tokens', function(tokens) {
				var arr_tokens = tokens['tokens'];
				if (arr_tokens.length != 0) {
					if (edit_mode) {
						for (var i=0; i < arr_tokens.length; i++) {
              var de_token = backgroundpage.b(arr_tokens[i]);
              if (de_token) {
                if(de_token.uniqid == passedId) {
                  arr_tokens[i] = en_token_data;
                }
              }
						}
					} else {
						arr_tokens.unshift(en_token_data);
					}
				} else if (arr_tokens.length > 20) {
          alert("You can only add up to 20 credentials");
          return false;
        } else {
					arr_tokens = [en_token_data];
        }

				chrome.storage.local.set({'tokens': arr_tokens} , function() { 
					alert('Saved Successfully');
					chrome.runtime.sendMessage({type: "gaq", target: "New_credentials_page_save_successful", behavior: "yes"});
          if (button_id == "submitButton-add") { 
            $("#clearButton").trigger('click');
            loadCredentialList();
          } else if (button_id == "submitButton") {
            //closeCurrentTab();
            $('.addingapitoken').empty();
            //$('.apimanager').empty();
            loadCredentialList();
           // $('.apimanager').append(' <span class="card-title black-text">API Credentials Manager <a href="#!" id="apicredstutorial" class="tooltipped" data-position="bottom" data-tooltip="Video tutorial on how to use this section"> <i class="material-icons blue-grey-text text-darken-2 tutorial-video-icon">play_circle_outline</i> </a> </span> <p>Manage your API credentials and toggle between different kinds of API tokens based on the service you are trying to access</p> <ul id="tokenlist" class="collection orange-text text-darken-2"></ul> <div id="apitab-nocredential" class="col s12 center-align" style="font-size: 13px; padding: 40px;"> <p>Looks like you have no API credentials configured, <a id="addnewtokenlink" href="#">click here</a> to configure one.</p><br/> <p>If you have already added your API token please refresh this page by clicking "command + shift + r"</p> </div> <a id="deletealltoken" href="#" class="btn blue-grey lighten-5 hoverable tooltipped" data-position="top" data-tooltip="Delete all tokens"> <i class="material-icons blue-grey-text text-darken-2">delete</i></a> <a id="addnewtoken" href="#" class="btn light-blue hoverable tooltipped" data-position="top" data-tooltip="Add new credential"><i class="material-icons">add</i></a> ');
          }
				});
			});
		});
  });

  $('#clearButton').click(function() {
    chrome.runtime.sendMessage({type: "gaq", target: "New_credentials_page_reset_btn", behavior: "clicked"});
    for (var i=0; i < apiTokenIds.length; i++) {
      obj_input = $('#'+apiTokenIds[i]).val(null);
    }
    $(".file-path").val(''); 
    $(":file").val(''); 
    Materialize.updateTextFields();
    $('select').material_select();
  });

  $('#closed_api_Button').click(function(){
    $('.addingapitoken').empty();
    loadCredentialList();
  });

	$(":file").change(function(){
    console.log('file uploaded');
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

} // document ready
