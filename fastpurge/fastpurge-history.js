$(document).ready(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "Purge_history_page", behavior: "loaded"});

  loadHistory(function(){
    initDataTable();
    var passedId = getUrlParameter('id'); 
    if (passedId){
      $(".show-more [requestId="+passedId+"]").trigger('click');
    }
  });

  $('#clearHistoryButton').click(function(){
    chrome.runtime.sendMessage({type: "gaq", target: "Purge_history_page_clearhistory", behavior: "clicked"});
    removeHistoryRecord();
  });

  $('#closeButton').click(function(){ 
    chrome.runtime.sendMessage({type: "gaq", target: "Purge_history_page_closebtn", behavior: "clicked"});
    closeCurrentTab(); 
  }); 

  $('body').on('click', '.show-more [requestId]', function () {
    var td = $(this);
    var tr = td.closest('tr');
    var tr_next = tr.next('tr');
    var purge_req_id = td.attr('requestId');
    td.children("i").text("expand_less");
    loadDetails(purge_req_id, function(data){
      if (tr_next.attr('class') == "shown") {
        td.children("i").text("expand_more");
        tr_next.hide();
        tr_next.remove();
      } else {
        tr.after(data);
      }
    });
  });

  $('body').on('click', '.delete-record [requestId]', function () {
    var td = $(this);
    var tr = td.closest('tr');
    var purge_req_id = td.attr('requestId');
    removeHistoryRecord(purge_req_id);
    tr.hide();
  });
});

function initDataTable() {
  $('#purge-table').DataTable({
    "columnDefs": [ {
      "targets"  : 'no-sort',
      "orderable": false
    }],
    "order":[
      [1, 'dsc']
    ]
  });
}

function loadHistory(callback) {
  $("#historylist").empty();
  chrome.storage.local.get('purgeHistory', function(purgedata) {
    var obj_records = purgedata['purgeHistory'];
    for (var purgeReqId in obj_records) {
      var obj_history = obj_records[purgeReqId];
      tbody_html = "<tr>"; 
      tbody_html += "<td class='show-more'><a href='#!' requestId='" + obj_history.requestId + "'>";
      tbody_html += "<i class='material-icons'>expand_more</i></a></td>"; 
      tbody_html += "<td>" + obj_history.requestedTime + "</td>"; 
      tbody_html += "<td>" + obj_history.token_used.desc.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_history.update_type.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_history.purge_type.toUpperCase() + "</td>"; 
      tbody_html += "<td>" + (obj_history.purgeId === undefined ? "Unknown" : obj_history.purgeId) + "</td>"; 
      tbody_html += "<td>" + obj_history.purge_objects.length + "</td>"; 
      tbody_html += "<td>" + obj_history.network.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_history.purge_request_accepted.capitalize() + "</td>"; 
      tbody_html += "<td class='delete-record'><a href='#!' requestId='" + obj_history.requestId + "'>";
      tbody_html += "<i class='material-icons'>delete</i></a></td>"; 
      tbody_html += "</tr>";
      $("#historylist").append(tbody_html);
    }
    callback();
  });
}

function removeHistoryRecord(purgeRecordId) {
  console.log('remove record was called')
  chrome.storage.local.get('purgeHistory', function(data) {
    var obj_records = data['purgeHistory'];
    if (purgeRecordId == null) {
      for (key in obj_records) {
        delete obj_records[key];
      }
    } else {
      delete obj_records[purgeRecordId];
    }
    chrome.storage.local.set({'purgeHistory': obj_records}, function(){
      if (Object.keys(obj_records).length == 0) {
        $('#purge-table').DataTable().clear().destroy();
        initDataTable();
      } 
    });
  });
}
