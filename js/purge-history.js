//Ricky Yu owns this page, please do comment out the section you edit or added so he is aware of the changes
function loadHistory() {
  $("#historylist").empty();

  chrome.storage.local.get(null, function(data) {
    var arr_history = [];
    for (var key in data) {
      if (key.startsWith("H_")) {
        arr_history.push(data[key]); 
      }
    }
  
    if (arr_history.length == 0) {
      $('#historytab').hide();
      $('#historytab-nohistory').show();
      return false;
    }

    arr_history.sort(function(a, b){
      var c = new Date(a.requestedTime);
      var d = new Date(b.requestedTime);
      return c - d;
    });

    arr_history.reverse();

    for (var i=0; i < arr_history.length; i++) {
      var obj_history = arr_history[i];
      var raw_response = obj_history.raw_response;
      tbody_html = "<tr>"; 
      tbody_html += "<td>" + obj_history.requestedTime + "</td>"; 
      tbody_html += "<td>" + obj_history.token_used.desc.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_history.update_type.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_history.purge_type.toUpperCase() + "</td>"; 
      tbody_html += "<td>" + obj_history.purgeId + "</td>"; 
      tbody_html += "<td>" + obj_history.purge_objects.length + "</td>"; 
      tbody_html += "<td>" + obj_history.network.capitalize() + "</td>"; 
      tbody_html += "<td>" + obj_history.purge_request_accepted.capitalize() + "</td>"; 
      tbody_html += "<td><a class='see-more-link' requestId=" + obj_history.requestId + ">See more</a></td>"; 
      tbody_html += "</tr>";
      $("#historylist").append(tbody_html);
    }
    $('#historytab').show();
    $('#historytab-nohistory').hide();
  });
}

$(document).ready(function(){
  loadHistory();

  $('#clearHistoryButton').click(function(){
    chrome.storage.local.get(null, function(data) {
      var arr_history = [];
      for (var key in data) {
        if (key.startsWith("H_")) {
          arr_history.push(key); 
        }
      }
      chrome.storage.local.remove(arr_history, function(){
        $('#historytab').hide();
        $('#historytab-nohistory').show();
      });
    });  
  });

  $(document).on('click', '.see-more-link', function(obj){
    chrome.tabs.create({url: 'purgedetails.html?id=' + $(this).attr('requestId')});
  });

  $('#closeButton').click(function(){ closeCurrentTab(); }); 
});
