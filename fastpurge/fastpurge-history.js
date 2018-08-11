$(document).ready(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "Purge_history_page", behavior: "loaded"});

  loadHistory(function(){
    initDataTable();
  });

  $('#clearHistoryButton').click(function(){
    chrome.runtime.sendMessage({type: "gaq", target: "Purge_history_page_clearhistory", behavior: "clicked"});
    chrome.storage.local.get(null, function(data) {
      var arr_history = [];
      for (var key in data) {
        if (key.startsWith("H_")) {
          arr_history.push(key); 
        }
      }
      chrome.storage.local.remove(arr_history, function(){
        $('#purge-table').DataTable().clear().destroy();
        initDataTable();
      });
    });  
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
});

function initDataTable() {
  $('#purge-table').DataTable({
    "columnDefs": [ {
      "targets"  : 'no-sort',
      "orderable": false,
    }],
    "order":[
      [0, 'dsc']
    ]
  });
}

function loadHistory(callback) {
  $("#historylist").empty();

  chrome.storage.local.get(null, function(data) {
    var arr_history = [];
    for (var key in data) {
      if (key.startsWith("H_")) {
        arr_history.push(data[key]); 
      }
    }

    for (var i=0; i < arr_history.length; i++) {
      var obj_history = arr_history[i];
      tbody_html = "<tr>"; 
      tbody_html += "<td>" + obj_history.requestedTime + "</td>"; 
      tbody_html += "<td>" + obj_history.token_used.desc.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_history.update_type.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_history.purge_type.toUpperCase() + "</td>"; 
      tbody_html += "<td>" + (obj_history.purgeId === undefined ? "Unknown" : obj_history.purgeId) + "</td>"; 
      tbody_html += "<td>" + obj_history.purge_objects.length + "</td>"; 
      tbody_html += "<td>" + obj_history.network.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_history.purge_request_accepted.capitalize() + "</td>"; 
      tbody_html += "<td class='show-more'><a href='#!' requestId='" + obj_history.requestId + "'>";
      tbody_html += "<i class='material-icons'>expand_more</i></a></td>"; 
      tbody_html += "</tr>";
      $("#historylist").append(tbody_html);
    }
    
    callback();
  });
}
