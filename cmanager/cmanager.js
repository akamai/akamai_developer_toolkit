var loadCredentialList = function () {
  $('#tokenlist').empty().hide();
  chrome.runtime.getBackgroundPage(function(backgroundpage) {
    chrome.storage.local.get('tokens', function(data) {
      var arr_tokens = data['tokens'];
      if (arr_tokens.length > 0) {
        for (i = 0; i < arr_tokens.length; i++) {
          var api_credential = backgroundpage.b(arr_tokens[i]);
          if (!api_credential) { api_credential = {desc: "Failed to load", tokentype: "Please delete and register again", uniqid: i}; }
          var list_html = '<li class="collection-item avatar disabled">';
          list_html += '<i class="material-icons key-img circle teal lighten-2 z-depth-1" style="display: none;">lock_open</i>';
          list_html += '<span class="center" style="font-size: 15px; font-weight: bold">' + api_credential.desc + '</span>';
          list_html += '<p>' + api_credential.tokentype + '</p>';
          list_html += '<p class="blue-grey-text">Click on Activate to enable this credential for your requests</p>';
          list_html += '<div class="secondary-content">';
          list_html += '<div><a id="activate_token_sidenav" href="#!" style="height: 25px; line-height: 25px;" tokenid="' + api_credential.uniqid + '" action="activate">Activate</a></div>';
          list_html += '<div><a href="#!" style="height: 25px; line-height: 25px;" tokenid="' + api_credential.uniqid + '" action="edit">Edit</a></div>';
          list_html += '<div><a href="#!" style="height: 25px; line-height: 25px;" tokenid="' + api_credential.uniqid + '" action="download">Download</a></div>';
          list_html += '<div><a href="#!" style="height: 25px; line-height: 25px;" tokenid="' + api_credential.uniqid + '" action="delete">Delete</a></div>';
          list_html += '</div></li>';
          $('#tokenlist').append(list_html);
        }
        // if (arr_tokens.length == 1) {$('[action=activate]').trigger('click')};
        $("#apitab-nocredential").hide();
        $('#tokenlist').show();
        markActiveToken();
      } else {
        $("#apitab-nocredential").show();
        return false;
      }
    });
  });
}

var loadActiveCredentiallist = function () {
  $('#activetoken_inuse').empty().hide();
  chrome.runtime.getBackgroundPage(function(backgroundpage) {
    chrome.storage.local.get('tokens', function(data) {
      var arr_tokens = data['tokens'];
      var activetokenid = backgroundpage.activatedTokenCache.uniqid;
     // console.log(activetokenid);
      //console.log(arr_tokens.length);
      if (arr_tokens.length >0 ){
        if (activetokenid !== undefined) {
          // var activetokenid = backgroundpage.activatedTokenCache.uniqid;
           //console.log(activetokenid);
           var api_credential1 = backgroundpage.activatedTokenCache;
          // console.log(api_credential1);
           if (!api_credential1) { api_credential1 = {desc: "Failed to load", tokentype: "Please delete and register again", uniqid: activetokenid}; }
           var list_html1 = '<div class="row"><div class="col s8">';
           list_html1 += '<li class="collection-item avatar1">';
           list_html1 += '<i class="material-icons key-img circle teal lighten-2 z-depth-1" style="display: none;">lock_open</i>';
           list_html1 += '<h5 class="" style="font-size: 20px; font-weight: bold">' + api_credential1.desc + '</h5>';
           list_html1 += '<p class="">' + api_credential1.tokentype + '</p>';
           list_html1 += '<p class="blue-grey-text">This is the credential that is currently active across the extension. This credential will be used for any OPEN api call the extension has to make.</p></li></div>';
           list_html1 += '<div class="col s4" style="height: 40px; line-height: 150px;">';
           list_html1 += '<a id="sidenavbutton" class="btn blue-grey lighten-5 hoverable blue-grey-text text-darken-3 center-align">Switch OPEN API credentials</a>';
           list_html1 += '</div>';
           $('#activetoken_inuse').append(list_html1);
          // $("#apitab-nocredential").hide();
           $('#activetoken_inuse').show();
 
        // $(".key-img").hide();
        // $("#activetoken_inuse").closest("li.avatar").find(".key-img").fadeToggle();
        // $('.collection-item.avatar').addClass("disabled");
        //$("#activetoken_inuse").closest("li.avatar").removeClass("disabled");
        // markActiveToken();
       }
       else {
        var list_html2 = '<li class="collection-item avatar">';
       // list_html2 += '<i class="material-icons key-img circle teal lighten-2 z-depth-1" style="display: none;">lock_open</i>';
        list_html2 += '<p class="center-align blue-grey-text"><b>Congrats on adding your first OPEN API credential!</b> You need to activate the credential in order to use it across the extension </p>';
        list_html2 += '<p class="center-align"><a id="sidenavbutton" class="btn light-blue hoverable white-text center-align activate_token_creds">Activate OPEN API credentials</a></p>';
        list_html2 += '</li>';
        $('#activetoken_inuse').append(list_html2);
        $('#activetoken_inuse').show();
       }
      }
 else {
        $("#apitab-nocredential").show();
        return false;
      }
    });
  });
}

//receive message that active token has been updated
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.msg === "activecachetokenupdated") {
          //  To do something
          loadActiveCredentiallist();
      }
  }
);

// Mark current active_token
var markActiveToken = function() {
  chrome.runtime.getBackgroundPage(function(backgroundpage) {
    $("a[tokenid='" + backgroundpage.activatedTokenCache.uniqid + "'][action='activate']").trigger('click');
  });
}

$('#deletealltoken').click(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "Delete_all_tokens", behavior: "clicked"});
  chrome.runtime.sendMessage({type: "cmanager", action: "deleteall",});
  $("#tokenlist").hide();
  $("#apitab-nocredential").show();
});

$('#addnewtoken, #addnewtokenlink').click(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "Add_new_credential", behavior: "clicked"});
 // chrome.tabs.create({
  //  url: 'cmanager/credential.html'
 // });
$('.addingapitoken').empty();
$('.addingapitoken').append(' <div class="container" style="width: auto;"> <div class="row" id="adding_creds"> <div class="col s8"> <div class="card"> <div class="card-content" style="font-size: 13px;"> <span class="card-title">Adding an API Credential</span> <div class="row cred_description"> <div class="input-field col s12 "> <input placeholder="" id="credential_desc" type="text"> <label for="credential_desc">Credential Description</label> </div> </div> <div class="row"> <div class="input-field col s12"> <input placeholder="" id="baseurl" type="text"> <label for="baseurl">Base URL (ensure you start the BaseURL with https://)</label> </div> </div> <div class="row"> <div class="input-field col s12"> <input placeholder="" id="accesstoken" type="text"> <label for="accesstoken">Access Token</label> </div> </div> <div class="row"> <div class="input-field col s12"> <input placeholder="" id="clienttoken" type="text"> <label for="clienttoken">Client Token</label> </div> </div> <div class="row"> <div class="input-field col s12"> <input placeholder="" id="secret" type="text"> <label for="secret">Secret</label> </div> </div> <div class="row"> <div class="input-field col s12"> <select id="tokentype"> <option value="" disabled selected>Choose Credential Type</option> <option value="General OPEN APIs">General OPEN APIs</option> <option value="Fast Purge APIs">Fast Purge APIs</option> <option value="Other OPEN APIs">Other OPEN APIs</option></select> <label>Credential Type</label> </div> </div> </div> <div class="card-action"> <div class="row right-align"> <div class="col s12"> <a id="closed_api_Button" class="blue-grey waves-effect waves-light btn">Close</a> <a id="submitButton-add" class="light-blue waves-effect waves-light btn">Save &amp; Add Another</a> <a id="submitButton" class="light-blue waves-effect waves-light btn">Save &amp; Close</a> <a id="clearButton" class="blue-grey waves-effect waves-light btn">Reset</a> </div> </div> </div> </div> </div> <div class="col s4"> <div class="card"> <div class="card-content"> <span class="card-title">Upload a credential file</span> <form action="#"> <div class="file-field input-field"> <div class="light-blue waves-effect waves-light btn" id="filebutton"> <span>File</span> <input type="file"> </div> <div class="file-path-wrapper"> <input class="file-path validate" type="text"> </div> </div> </form> </div> </div> </div> </div> <!-- main row --> </div>');

loadcredentialaddition();

});

$(document).on('click', '#tokenlist li a', function(event) {
  var button_type = $(this).attr('action');
  var token_id = $(this).attr('tokenid');
  switch (button_type) {
    case "edit":
      chrome.tabs.create({url: 'cmanager/credential.html?id=' + token_id});
      chrome.runtime.sendMessage({type: "gaq", target: "Editing_an_api_token", behavior: "clicked"});
      break;
    case "delete":
      $(this).closest("li.avatar").fadeOut("normal", function() {
        if ($(this).parent("ul").children().length === 1) {
          $("#tokenlist").hide();
          $("#apitab-nocredential").show();
        }
        $(this).remove();
      });
      //loadActiveCredentiallist();
      
      chrome.runtime.sendMessage({type: "cmanager", action: "delete", token_id: token_id});
      chrome.runtime.sendMessage({type: "gaq", target: "Deleting_an_api_token", behavior: "clicked"});
      break;
    case "activate":
      $(".key-img").hide();
      $(this).closest("li.avatar").find(".key-img").fadeToggle();
      $('.collection-item.avatar').addClass("disabled");
      $(this).closest("li.avatar").removeClass("disabled");

      chrome.runtime.sendMessage({type: "cmanager", action: "activate", token_id: token_id});
      chrome.runtime.sendMessage({type: "gaq", target: "Activating_an_api_token", behavior: "clicked"});
      break;
    case "download":
      chrome.runtime.sendMessage({type: "cmanager", action: "download", token_id: token_id});
      chrome.runtime.sendMessage({type: "gaq", target: "Downloading_an_api_token", behavior: "clicked"});
      break;
    default:
      break;
  }
});
