$(document).ready(function(){
  chrome.runtime.sendMessage({type: "gaq", target: "Debug_errorcode_result_page", behavior: "loaded"});

  $('#clearDebugRecordButton').click(function(){
    chrome.runtime.sendMessage({type: "gaq", target: "Debug_errorcode_page_clearhistory", behavior: "clicked"});
    removeDebugReqRecord();
  });

  loadDebugReqResult(function(){
    initDataTable();
    var passedId = getUrlParameter('id'); 
    if (passedId){
      $(".show-more [requestId="+passedId+"]").trigger('click');
    }
  });


  $('#closeButton').click(function(){ 
    chrome.runtime.sendMessage({type: "gaq", target: "Debug_errorcode_page_closebtn", behavior: "clicked"});
    closeCurrentTab(); 
  }); 

  $('body').on('click', '.show-more [requestId]', function() {
    var td = $(this);
    var tr = td.closest('tr');
    var tr_next = tr.next('tr');
    var debug_req_id = td.attr('requestId');
    td.children("i").text("expand_less");
    loadDebugReqResultDetails(debug_req_id, function(data){
      if (tr_next.attr('class') == "shown") {
        td.children("i").text("expand_more");
        tr_next.hide();
        tr_next.remove();
      } else {
        tr.after(data);
      }
    });
  });

  $('body').on('click', '.delete-record [requestId]', function() {
    var td = $(this);
    var tr = td.closest('tr');
    var debug_req_id = td.attr('requestId');
    removeDebugReqRecord(debug_req_id);
    tr.hide();
  });
});

function loadDebugReqResult(callback) {
  $("#debugreqlist").empty();
  chrome.storage.local.get(['translateErrorCodeHistory', 'fetchLogByIpHistory'], function(debugdata) {
    var obj_results_errorcode = debugdata['translateErrorCodeHistory'];
    var obj_results_fetchlog = debugdata['fetchLogByIpHistory'];
    var obj_results_merged = Object.assign({}, obj_results_fetchlog, obj_results_errorcode);
    for (var debugReqId in obj_results_merged) {
      var obj_result = obj_results_merged[debugReqId];
      tbody_html = "<tr>"; 
      tbody_html += "<td class='show-more'><a href='#!' requestId='" + obj_result.requestId + "'>";
      tbody_html += "<i class='material-icons'>expand_more</i></a></td>"; 
      tbody_html += "<td>" + obj_result.requestedTime + "</td>"; 
      tbody_html += "<td>" + obj_result.debug_type.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_result.token_desc + "</td>"; 
      tbody_html += "<td>" + (obj_result.errorcode == undefined ? obj_result.hostname + ", " + obj_result.ipaddr : obj_result.errorcode) + "</td>"; 
      tbody_html += "<td>" + obj_result.status.capitalize() + "</td>"; 
      tbody_html += "<td class='delete-record'><a href='#!' requestId='" + obj_result.requestId + "'>";
      tbody_html += "<i class='material-icons'>delete</i></a></td>"; 
      tbody_html += "</tr>";
      $("#debugreqlist").append(tbody_html);
    }
    callback();
  });
}

function initDataTable() {
  $('#debug-request-table').DataTable({
    "columnDefs": [ {
      "targets"  : 'no-sort',
      "orderable": false
    }],
    "order":[
      [1, 'dsc']
    ]
  });
}

function removeDebugReqRecord(debugReqRecordId) {
  if (debugReqRecordId != null) {
    chrome.storage.local.get(['translateErrorCodeHistory', 'fetchLogByIpHistory'], function(debugdata) {
      if(debugReqRecordId.startsWith("DebugErrCode")) {
        target = "translateErrorCodeHistory";
      } else if (debugReqRecordId.startsWith("DebugFetchLog")) {
        target = "fetchLogByIpHistory";
      }
      var obj_results = debugdata[target];
      delete obj_results[debugReqRecordId];
      var beforeSave = {};
      beforeSave[target] = obj_results;
      chrome.storage.local.set(beforeSave, function(){
        if (Object.keys(debugdata['translateErrorCodeHistory']).length == 0 &&
        Object.keys(debugdata['fetchLogByIpHistory'].length == 0)) { 
          destoryAndInitDataTable();
        }
      });
    });
  } else if (debugReqRecordId == null) {
    chrome.storage.local.set({translateErrorCodeHistory: {}, fetchLogByIpHistory: {}}, function() {
      destoryAndInitDataTable();
    });
  }
}

function destoryAndInitDataTable() {
  $('#debug-request-table').DataTable().clear().destroy();
  initDataTable();
}
