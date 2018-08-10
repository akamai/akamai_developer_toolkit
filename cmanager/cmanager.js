var loadCredentialList = function () {
  $('#tokenlist').empty().hide();
  chrome.runtime.getBackgroundPage(function(background) {
    chrome.storage.local.get('tokens', function(data) {
      var arr_tokens = data['tokens'];
      if (typeof arr_tokens === 'undefined' || arr_tokens === null) {
        arr_tokens = [];
      }
      if (arr_tokens.length > 0) {
        for (i = 0; i < arr_tokens.length; i++) {
          var api_credential = background.b(arr_tokens[i]);
          var list_html = '<li class="collection-item avatar disabled">';
          list_html += '<i class="material-icons key-img circle teal lighten-2 z-depth-1" style="display: none;">lock_open</i>';
          list_html += '<span class="center" style="font-size: 15px; font-weight: bold">' + api_credential.desc + '</span>';
          list_html += '<p>' + api_credential.tokentype + '</p>';
          list_html += '<p class="blue-grey-text">Click on Activate to enable this credential for your requests</p>';
          list_html += '<div class="secondary-content">';
          list_html += '<div><a href="#!" tokenid="' + api_credential.uniqid + '" action="activate">Activate</a></div>';
          list_html += '<div><a href="#!" tokenid="' + api_credential.uniqid + '" action="edit">Edit</a></div>';
          list_html += '<div><a href="#!" tokenid="' + api_credential.uniqid + '" action="download">Download</a></div>';
          list_html += '<div><a href="#!" tokenid="' + api_credential.uniqid + '" action="delete">Delete</a></div>';
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

// Mark current active_token
var markActiveToken = function() {
  chrome.runtime.getBackgroundPage(function(background) {
    chrome.storage.local.get('active_token', function(data) {
      var active_token = background.b(data['active_token']);
      if (typeof active_token != 'undefined' || active_token != null) {
        $("a[tokenid='" + active_token.uniqid + "'][action='activate']").trigger('click');
      }
    });
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
  chrome.tabs.create({
    url: 'cmanager/credential.html'
  });
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
