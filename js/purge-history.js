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
  
        li_header_html = "<div class='col s2' style='width: inherit;'>" + obj_history.requestedTime.split(' ')[1] + "</div>";
        li_header_html += "<div class='col s1' style='width: inherit;'>" + obj_history.purge_type + "</div>";
        li_header_html += "<div class='col s6'>" + obj_history.purgeId + "</div>";
        li_header_html += "<div class='col s2'>" + obj_history.purge_request_accepted.capitalize() + "</div>";
        li_header_html += "<div class='col s2' style='width: inherit;'>" + obj_history.purge_progress + "</div>";
        li_header = "<div class='collapsible-header' style='padding: 0px'>" + li_header_html + "</div>";
  
        li_body_html = "<li><b>Submitted</b> - " + obj_history.requestedTime + " GMT</li>";
        li_body_html += "<li><b>Last Updated</b> - " + obj_history.lastupdated + " GMT</li>";
        li_body_html += "<li><b>Purge Type</b> - " + obj_history.purge_type + "</li>";
        li_body_html += "<li><b>Purge Progress</b> - " + obj_history.purge_progress + "</li>";
        li_body_html += "<li><b>Network</b>- " + obj_history.network + "</li>";
  
        li_body_html_response = "";
        for(var key in raw_response) {
          li_body_html_response += "<li>" + key + " - " + raw_response[key] + "</li>";
        }
        li_body_html_response = "<ul>" + li_body_html_response + "</ul>";
        li_body_html += "<p><li><b>Response</b>" + li_body_html_response + "</li></p>";
  
        li_body_html_urls = "";
        for(var j=0; j < obj_history.urls.length; j++) {
          li_body_html_urls += "<li>" + obj_history.urls[j] + "</li>";
        }
        li_body_html_urls = "<ul>" + li_body_html_urls + "</ul>";
        li_body_html += "<p><li><b>Purge Objects</b>" + li_body_html_urls + "</li></p>";
  
        li_body_html += '<p><a href="#" class="see-more-link" requestId='+obj_history.requestId+'>See more</a></p>';
  
        li_body = "<div class='collapsible-body'><ul>" + li_body_html + "</ul></div>";
        li_msg = "<li>" + li_header + li_body + "</li>";
        $("#historylist").append(li_msg);
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
  
  