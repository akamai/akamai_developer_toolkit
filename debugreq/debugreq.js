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

$('#debughistorydetails').click(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "View_debug_history", behavior: "clicked"});
  chrome.tabs.create({
    url: 'debugreq/debugreq-history.html'
  });
});

$('#debug-errorcode-btn').click(function() {
  var errorcode = $('#debug-errorcode').val().trim();
  if (errorcode.split(".").length != 4) {
    Materialize.toast('Error Reference Code is not in the right format', 1500);
    $('#debug-errorcode').focus();
    return false;
  }
  var this_obj = $(this);
  var this_html = $(this).html();
  this_obj.addClass("disabled");
  this_obj.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
  chrome.runtime.getBackgroundPage(function(backgroundpage) {
    backgroundpage.translateErrorCode(errorcode, function(request_result) {
      this_obj.removeClass("disabled").blur();
      this_obj.html(this_html);
    });
  });
});

$('#debug-fetchlog-btn').click(function() {
  var debug_ipaddr = $("#debug-ipaddr").val().trim();
  var debug_hostname = $("#debug-hostname").val().trim();

  if(isEmpty(debug_ipaddr) || !isValidIPv4(debug_ipaddr)) {
    Materialize.toast('Please enter valid IP address', 1500);
    $("#debug-ipaddr").focus();
    return false;
  } else if(isEmpty(debug_hostname) || !isValidDomain(debug_hostname)) {
    Materialize.toast('Please enter valid Hostname', 1500);
    $("#debug-hostname").focus();
    return false;
  }

  var this_obj = $(this);
  var this_html = $(this).html();
  this_obj.addClass("disabled");
  this_obj.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
  chrome.runtime.getBackgroundPage(function(backgroundpage) {
    backgroundpage.getLogLinesFromIP({ipaddr: debug_ipaddr, hostname: debug_hostname}, function(request_result) {
      this_obj.removeClass("disabled").blur();
      this_obj.html(this_html);
    });
  });
});

