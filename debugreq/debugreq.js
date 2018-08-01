chrome.storage.local.get('akamaiDebugHeaderSwitch', function(data) {
  var type = data['akamaiDebugHeaderSwitch'];
  $("#updatetype-debugheaders").prop('checked', (type == 'OFF') ? false : true);
});

$("#updatetype-debugheaders").change(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "toggle_debug_headers", behavior: "clicked"});
  var type = $(this).prop("checked") ? "ON" : "OFF";
  chrome.runtime.sendMessage({
    type: "browser-akamaidebugheaderswitch",
    body: type
  });
});

$('#debughistorydetails, #debughistorydetailslink').click(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "View_debug_history", behavior: "clicked"});
  chrome.tabs.create({
    url: 'debugreq/debugreq-history.html'
  });
});

$('#debugdata').click(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "Fetch_logs", behavior: "clicked"});

  var arr_target_debugdata = $('#debugurls').val().split("\n");
  var arr_target_ghostIP = $('#ghostIp').val().split("\n");
  var submit_buttons = $('#debugdata');

  //enter code to differentiate between error code and request ID
  //throws error when nothing is entered
  if (arr_target_debugdata.filter(Boolean).length == 0) {
    Materialize.toast('Please enter valid error codes or request ID', 1500);
    return false;
  } else {
    var this_obj = $(this);
    var this_html = $(this).html();
    submit_buttons.addClass("disabled");
    this_obj.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage.makeErrorRefReq(arr_target_debugdata.filter(Boolean), arr_target_ghostIP.filter(Boolean), function(request_result) {
        submit_buttons.removeClass("disabled").blur();
        this_obj.html(this_html);
      });
    });
  }
});
