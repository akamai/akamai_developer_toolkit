String.prototype.capitalize = function(lower) {
  return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function isEmpty(val) {
  return val === null || val === '' || jQuery.isEmptyObject(val);
}

function sleep(milisec, callback) {
  setTimeout(function(){ 
    if (typeof callback != 'undefined') {
      callback();
    }
  }, milisec);
}

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

function getCurrentDatetimeUTC(format) {
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
  if(format == "ISO-8601") {
    return temp_arr[0] + '-' + temp_arr[1] + '-' + temp_arr[2] + 'T' + temp_arr[3] + ':' + temp_arr[4] + ':' + temp_arr[5] + 'Z';
  } else {
    return temp_arr[0] + '/' + temp_arr[1] + '/' + temp_arr[2] + ' ' + temp_arr[3] + ':' + temp_arr[4] + ':' + temp_arr[5];
  }
}

function isValidIPv4(ip) {
  var ipre = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/g;
  return ipre.test(ip);
}

function isValidDomain(domain) {
  var domainre= /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,}\.?((xn--)?([a-z0-9\-.]{1,61}|[a-z0-9-]{1,30})\.?[a-zA-Z0-9]{2,})$/i;
  return domainre.test(domain);
}
