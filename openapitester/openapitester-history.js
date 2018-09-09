var tableapis = {};
$(document).ready(function() {

    chrome.runtime.sendMessage({type: "gaq", target: "OpenAPI_history_page", behavior: "loaded"});
  
    loadHistory(function(){
      initDataTable();
      var passedId = getUrlParameter('id'); 
      if (passedId){
        $(".show-more [requestId="+passedId+"]").trigger('click');
      }
    });
  
    $('#clearHistoryButton').click(function(){
      chrome.runtime.sendMessage({type: "gaq", target: "OpenAPI_history_page_clearhistory", behavior: "clicked"});
      removeHistoryRecord();
    });
  
    $('#closeButton').click(function(){ 
      chrome.runtime.sendMessage({type: "gaq", target: "OpenAPI_history_page_closebtn", behavior: "clicked"});
      closeCurrentTab(); 
    }); 
  
    $('body').on('click', '.show-more [requestId]', function () {
      var td = $(this);
      var tr = td.closest('tr');
      var tr_next = tr.next('tr');
      var openapi_req_id = td.attr('requestId');
      td.children("i").text("expand_less");
      loadDetails(openapi_req_id, function(data){
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
      var openapi_req_id = td.attr('requestId');
      removeHistoryRecord(openapi_req_id);
      tr.hide();
    });
  });

  function initDataTable(){
    tableapis = $('#openapi-table').DataTable({
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
    chrome.storage.local.get('openapiHistory', function(openapidata) {
      var obj_records = openapidata['openapiHistory'];
      for (var openapiReqId in obj_records) {
        var obj_history = obj_records[openapiReqId];
        tbody_html = "<tr>"; 
        tbody_html += "<td class='show-more'><a href='#!' requestId='" + obj_history.requestId + "'>";
        tbody_html += "<i class='material-icons'>expand_more</i></a></td>"; 
        tbody_html += "<td>" + obj_history.requestedTime + "</td>"; 
        tbody_html += "<td>" + obj_history.token_desc + "</td>"; 
        tbody_html += "<td>" + obj_history.method + "</td>"; 
        tbody_html += "<td>" + obj_history.endpoint + "</td>"; 
        tbody_html += "<td>" + obj_history.status + "</td>"; 
        tbody_html += "<td class='delete-record'><a href='#!' requestId='" + obj_history.requestId + "'>";
        tbody_html += "<i class='material-icons'>delete</i></a></td>"; 
        tbody_html += "</tr>";
        $("#historylist").append(tbody_html);
      }
      callback();
    });
  }
  
  function removeHistoryRecord(openapiRecordId) {
    console.log('remove record was called')
    chrome.storage.local.get('openapiHistory', function(data) {
      var obj_records = data['openapiHistory'];
      if (openapiRecordId == null) {
        for (key in obj_records) {
          delete obj_records[key];
        }
      } else {
        delete obj_records[openapiRecordId];
      }
      chrome.storage.local.set({'openapiHistory': obj_records}, function(){
        if (Object.keys(obj_records).length == 0) {
          $('#openapi-table').DataTable().clear().destroy();
          initDataTable();
        } 
      });
    });
  }
  


  function addRecordintoHistory(){
    $('#openapi-table').DataTable().clear().destroy();
    loadHistory(function(){
      initDataTable();
    });
  }
  