function loadHistory() {
  $("#debughistorylist").empty();
  chrome.storage.local.get(null, function(data) {
    var arr_history = [];
    for (var key in data) {
      if (key.startsWith("D_")) {
        arr_history.push(data[key]); 
      }
    }  

    if (arr_history.length == 0) {
      $('#debughistorytab').hide();
      $('#debughistorytab-nohistory').show();
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

      li_header_html = "<div class='col s2' style='width: inherit;'>" + obj_history.requestedTime.split(' ')[1] + "</div>";
      if(jQuery.isEmptyObject(obj_history.ghost_IP)){
        li_header_html += "<div class='col s3'>" + obj_history.refID + "</div>";
      }
      else{
        li_header_html += "<div class='col s3'>" + obj_history.hostname_entered + "</div>";
      }
      
      li_header_html += "<div class='col s2'>" + obj_history.reason_for_failure + "</div>";
      li_header_html += "<div class='col s2'>" + obj_history.error_response_code + "</div>";
      if(jQuery.isEmptyObject(obj_history.ghost_IP)){
        li_header_html += "<div class='col s3'>" + obj_history.serverIp + "</div>";
      }
      else{
        li_header_html += "<div class='col s3'>" + obj_history.ghost_IP + "</div>";
      }
      
      li_header = "<div class='collapsible-header' style='padding: 0px'>" + li_header_html + "</div>";

      li_body_html = "<li><b>Submitted</b> - " + obj_history.requestedTime + " GMT</li>";
      li_body_html += "<li><b>Reason for failure / Status</b> - " + obj_history.reason_for_failure + "</li>";
      if(jQuery.isEmptyObject(obj_history.ghost_IP)){
        li_body_html += "<li><b>Reference Error Code</b> - " + obj_history.refID + "</li>";
      }
      else{
        li_body_html += "<li><b>Hostname entered to fetch logs</b> - " + obj_history.hostname_entered + "</li>";
      }
      
      if(jQuery.isEmptyObject(obj_history.ghost_IP)){
        li_body_html += "<li><b>Requested URL</b> - " + obj_history.requesturl + "</li>";
      }
      else{
        //li_body_html += "<li><b>Requested URL</b> - " + obj_history.requesturl + "</li>";
      }

      
     // li_body_html += "<li><b>Purge Progress</b> - " + obj_history.debug_progress + "</li>";
      //li_body_html += "<li><b>Network</b>- " + obj_history.network + "</li>";

      li_body_html_response = "";
      for(var key in raw_response) {
        li_body_html_response += "<li>" + key + " - " + raw_response[key] + "</li>";
      }
      li_body_html_response = "<ul>" + li_body_html_response + "</ul>";
     
      li_body_html += "<p><li><b>Full Response:</b>" + li_body_html_response + "</li></p>";


      li_body_html += '<p><a href="#" class="see-more-link" requestId='+obj_history.requestId+'>See more</a></p>';
      li_body_html += '<p><a href="#" class="learnmore_debug">Click here</a> to view all "reason for failure" codes and its meaning</p>';
      

      li_body = "<div class='collapsible-body'><ul>" + li_body_html + "</ul></div>";
      li_msg = "<li>" + li_header + li_body + "</li>";
      $("#debughistorylist").append(li_msg);
    }

    $('#debughistorytab').show();
    $('#debughistorytab-nohistory').hide();
  });
}


$(document).ready(function(){


  loadHistory();

    $('#cleardebugHistoryButton').click(function(){
      chrome.storage.local.get(null, function(data) {
        var arr_history = [];
        for (var key in data) {
          if (key.startsWith("D_")) {
            arr_history.push(key); 
          }
        }
        chrome.storage.local.remove(arr_history, function(){
          $('#debughistorytab').hide();
          $('#debughistorytab-nohistory').show();
        });
      });  
    });

   /* $('#learnmore_debug').click(function(){
      chrome.tabs.create({url: 'https://learn.akamai.com/en-us/api/core_features/diagnostic_tools/v2.html#errorcodes'});
    });*/

    $(document).on('click', '.learnmore_debug', function(){
      chrome.tabs.create({url: 'https://learn.akamai.com/en-us/api/core_features/diagnostic_tools/v2.html#errorcodes'});
    });

    $(document).on('click', '.see-more-link', function(obj){
      chrome.tabs.create({url: 'debugdetails.html?id=' + $(this).attr('requestId')});
    });

    $('#closeButton').click(function(){ closeCurrentTab(); }); 


});

