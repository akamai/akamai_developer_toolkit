function loadDetails(openapireq_req_id, callback) {
    chrome.storage.local.get('openapiHistory', function(data) {
      var obj_records = data['openapiHistory'];
      var history_data = obj_records[openapireq_req_id];
  
      var html = '<tr class="shown">';
      html += '<td colspan="10">';
      html += '<table class="history-table">';
      
      var better_title = {
        raw_response: "Raw Response",
        lastupdated: "Last Updated",
        requestedTime: "Request Time",
        token_desc: "Credential Used",
        requestId: "Request Id",
        status: "Response Status",
        method: "HTTP Method",
        endpoint: "API endpoint"
 
      }
  
      var arr_keys = Object.keys(history_data).reverse();
  
      for(var i=0; i < arr_keys.length; i++) {
        let key = arr_keys[i];
        var text = "";
        if (jQuery.type(history_data[key]) == 'object' && key != 'token_desc') {
          text = "<pre>" + JSON.stringify(history_data[key], null, 2) + "</pre>";
        } else if (jQuery.type(history_data[key]) == 'array') {
          for(var k=0; k < history_data[key].length; k++) {
            text += "<p>" + history_data[key][k] + "</p>";
          }
        } else if (key == 'token_desc') {
          text = history_data[key];
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
  