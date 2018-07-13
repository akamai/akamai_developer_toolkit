String.prototype.capitalize = function(lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function closeCurrentTab() {
  chrome.tabs.getCurrent(function(tab) {
    chrome.tabs.remove(tab.id);
  });
}

function getCurrentDatetimeUTC() {
  obj_date = new Date();
  year = obj_date.getUTCFullYear();
  month = obj_date.getUTCMonth() + 1;
  date = obj_date.getUTCDate();
  hours = obj_date.getUTCHours();
  minutes = obj_date.getUTCMinutes();
  seconds = obj_date.getUTCSeconds();
  temp_arr = [year, month, date, hours, minutes, seconds]
  for (i = 0; i < temp_arr.length; i++) {
    if (temp_arr[i] < 10) {
      temp_arr[i] = '0' + temp_arr[i];
    }
  }
  return temp_arr[0] + '/' + temp_arr[1] + '/' + temp_arr[2] + ' ' + temp_arr[3] + ':' + temp_arr[4] + ':' + temp_arr[5];
}

function createLiHtml(field_data) {
  var html = "";

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

  return html;
}
