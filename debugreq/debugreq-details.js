function loadDebugReqResultDetails(debug_req_id, callback) {
  var loadTarget = "";

  if(debug_req_id.startsWith("DebugErrCode")) {
    loadTarget = "translateErrorCodeHistory";
  } else if(debug_req_id.startsWith("DebugFetchLog")) {
    loadTarget = "fetchLogByIpHistory";
  }

  chrome.storage.local.get(loadTarget, function(data) {
    var obj_records = data[loadTarget];
    var history_data = obj_records[debug_req_id];

    var html = '<tr class="shown">';
    html += '<td></td>';
    html += '<td colspan="6">';
    html += '<table class="history-table">';
    
    var better_title = {
      lastupdated: "Last Updated",
      raw_response: "Raw Response",
      requestId: "Request Id",
      requestedTime: "Request Time",
      token_desc: "Credential Used",
      errorcode: "ErrorCode",
      status: "Status",
      debug_type: "DebugReqType",
      ipaddr: "IP address",
      hostname: "Hostname"
    }

    var arr_keys = Object.keys(history_data).reverse();

    for(var i=0; i < arr_keys.length; i++) {
      let key = arr_keys[i];
      var text = "";
      if (jQuery.type(history_data[key]) == 'object') {
        text = "<pre>" + JSON.stringify(history_data[key], null, 2) + "</pre>";
      } else if (jQuery.type(history_data[key]) == 'array') {
        for(var k=0; k < history_data[key].length; k++) {
          text += "<p>" + history_data[key][k] + "</p>";
        }
      } else {
        text = history_data[key];
      }
      html += "<tr><td><b>" + better_title[key] + "</b></td><td>" + text + "</td></tr>";
    }
    html += '</table>';
    html += '</td>';
    html += '</tr>';

		callback(html);
	});
}
