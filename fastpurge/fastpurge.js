chrome.storage.local.get('update_type', function(data) {
  var type = data['update_type'];
  if (typeof type == 'undefined' || type == null) {
    chrome.storage.local.set({update_type: 'invalidate'}, function() {
      $("#updatetype-switch").prop('checked', false);
    });
  }
  $("#updatetype-switch").prop('checked', (type == 'invalidate') ? false : true);
});

$('#purgehistorydetails, #purgehistorydetailslink').click(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "View_purge_history", behavior: "clicked"});
  chrome.tabs.create({
    url: 'fastpurge/fastpurge-history.html'
  });
});

$("#updatetype-switch").change(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "toggle_purge_type", behavior: "clicked"});
  var type = $(this).prop("checked") ? "delete" : "invalidate";
  chrome.storage.local.set({
    update_type: type
  });
});

$('#submitButton-stg, #submitButton-pro').click(function(obj) {
	chrome.runtime.getBackgroundPage(function(backgroundpage) {
		backgroundpage._gaq.push(['_trackEvent', 'Submit_purge_req', 'clicked']);
	});
	var arr_purge_targets = $('#purgeurls').val().split("\n");
	var network = $(this).attr('network');
	for (i = 0; i < arr_purge_targets.length; i++) {
		arr_purge_targets[i] = arr_purge_targets[i].trim().replace(/\s+/g, '');
	}
	if (arr_purge_targets.filter(Boolean).length == 0) {
		Materialize.toast('Please enter Cpcode/Tag/URL to purge', 1500);
		return false;
	} else {
		var submit_buttons = $('#submitButton-stg, #submitButton-pro');
		var this_obj = $(this);
		var this_html = $(this).html();
		submit_buttons.addClass("disabled");
		this_obj.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
		chrome.runtime.getBackgroundPage(function(backgroundpage) {
			backgroundpage.makePurgeRequest(arr_purge_targets.filter(Boolean), network, function(request_result) {
				submit_buttons.removeClass("disabled").blur();
				this_obj.html(this_html);
			});
		});
	}
});
