//Ricky Yu owns this page, please do comment out the section you edit or added so he is aware of the changes

$(document).ready(function(){
  chrome.runtime.getBackgroundPage(function (backgroundpage){
    backgroundpage._gaq.push(['_trackEvent', 'Debug_details_page', 'loaded']);
   });

    var passedId = getUrlParameter('id');
  
    if (passedId == '' || passedId == null) {
      closeCurrentTab();
      return false;
    }
  
    chrome.storage.local.get(null, function(data) {
      var arr_history = [];
      var arr_checkers = [];
      var history_data = {};
  
      for (var key in data) {
        if (key.startsWith("D_")) {
          arr_history.push(data[key]); 
        }
      }
  
  
      //if there is no hisotry
      if (arr_history.length == 0) {
        $("#debugdetails-wrapper").html("<div class='row'>No information available.</div>");
        return;
      }
  
      for(var j=0; j < arr_history.length; j++) {
        if (arr_history[j].requestId == passedId) {
          history_data = arr_history[j];
        }
      }
  
      if (jQuery.isEmptyObject(history_data)) {
        $("#debugdetails-wrapper").html("<div class='row'>No information available.</div>");
      }
  
      for(var key in history_data) {
  
        var field_name = key.capitalize();
        var field_data = history_data[key];
  
        if(jQuery.type(field_data) == 'object') {
          var inhtml = "";
          for (var each in field_data){
            inhtml += '<li><div class="row">';
            inhtml += '<div class="col s4">' + each.capitalize() + '</div>';
            inhtml += '<div class="col s8">' + field_data[each] + '</div>';
            inhtml += '</div></li>';
          }
          inhtml = '<ul>' + inhtml + '</ul>';
          field_data = inhtml;
        } else if(jQuery.type(field_data) == 'array') {
          var inhtml = "";
          for (var j=0; j<field_data.length; j++){
            inhtml += '<li>' + field_data[j] + '</li>';
          }
          inhtml = '<ul>' + inhtml + '</ul>';
          field_data = inhtml;
        }
  
        var html = "<li class='collection-item'><div class='row'>";
        html += '<div class="col s4">' + field_name + '</div>'; 
        html += '<div class="col s8">' + field_data + '</div>';
        html += "</div></li>";
        $('#debugdetails').append(html);
      }
  
    // *********************************
  
    chrome.alarms.getAll(function (arr_alarms) { 
      var checker = {};
      var alarm = {};
  
      for(var k=0; k < arr_checkers.length; k++) {
        if(arr_checkers[k].requestId == passedId) {
          checker = arr_checkers[k];
        }
      }
  
      for(var a=0; a < arr_alarms.length; a++) {
        if (arr_alarms[a].name == passedId) {
          alarm = arr_alarms[a];
        }
      }
  
      // print purge status
      if (!jQuery.isEmptyObject(checker)) {
        for (var each in checker) {
          var checker_key = each.capitalize();
          var checker_data = checker[each];
  
          if (checker_key == 'Token') { continue; }
          
          if (jQuery.type(checker_data) == 'object') {
            var inhtml = "";
            for (var each in checker_data){
              inhtml += '<li><div class="row">';
              inhtml += '<div class="col s4">' + each.capitalize() + '</div>';
              inhtml += '<div class="col s8">' + checker_data[each] + '</div>';
              inhtml += '</div></li>';
            }
            inhtml = '<ul>' + inhtml + '</ul>';
            checker_data = inhtml;
          }
          var html = "<li class='collection-item'><div class='row'>";
            html += '<div class="col s4">' + checker_key + '</div>'; 
            html += '<div class="col s8">' + checker_data + '</div>';
            html += "</div></li>";
            $('#debug-status').append(html);
          }
        } else {
          $("#debug-status-wrapper").hide();
        }
  
        // print alarm
        if(!jQuery.isEmptyObject(alarm)) {
          for (var each in alarm) {
            var alarm_key = each.capitalize();
            var alarm_data = alarm[each];
            
            if (jQuery.type(alarm_data) == 'object') {
              var inhtml = "";
              for (var each in checker_data){
                inhtml += '<li><div class="row">';
                inhtml += '<div class="col s4">' + each.capitalize() + '</div>';
                inhtml += '<div class="col s8">' + alarm_data[each] + '</div>';
                inhtml += '</div></li>';
              }
              inhtml = '<ul>' + inhtml + '</ul>';
              alarm_data = inhtml;
            }
            var html = "<li class='collection-item'><div class='row'>";
            html += '<div class="col s4">' + alarm_key + '</div>'; 
            html += '<div class="col s8">' + alarm_data + '</div>';
            html += "</div></li>";
            $('#scheduler-detail').append(html);
          }
        } else {
          $("#scheduler-detail-wrapper").hide();
        }
      });
    });
  
    $('#closeButton').click(function(){ 
      chrome.runtime.getBackgroundPage(function (backgroundpage){
        backgroundpage._gaq.push(['_trackEvent', 'Debug_details_page_closebtn', 'clicked']);
       });
      closeCurrentTab(); 
    }); 

  });
  
  