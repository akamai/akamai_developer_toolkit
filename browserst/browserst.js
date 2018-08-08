chrome.runtime.onInstalled.addListener(function() {
  if (localStorage.length > 0) {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key === 'rev') continue;
      data[key] = localStorage.getItem(key);
    }
    chrome.storage.local.clear();
    chrome.storage.local.set(data);
    localStorage.clear();
  }

  // chrome.storage.sync.get(null, function(items) {
  //   chrome.storage.local.set(items);
  // });

  chrome.storage.local.get('lastProfileId', function(lastProfileIdObj) {
    var lastProfileId = lastProfileIdObj['lastProfileId'];

    if (isEmpty(lastProfileId)) {
      chrome.storage.local.set({
        'lastProfileId': 'profile-direct'
      });
    }

    setProxy(lastProfileId);
  });
});

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//   var storageToBeChanged = namespace === 'local' ? chrome.storage.sync : chrome.storage.local;
//   for (key in changes) {
//     var storageChange = changes[key];
//     if (isEmpty(storageChange.newValue)) {
//       storageToBeChanged.remove(key);
//     } else {
//       var obj = {};
//       obj[key] = storageChange.newValue;
//       storageToBeChanged.set(obj);
//     }
//   }
// });

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get('lastProfileId', function(lastProfileIdObj) {
    var lastProfileId = lastProfileIdObj['lastProfileId'];
    setProxy(lastProfileId);
  });
});

function closeOtherForms() {
  $('[id="editProxyBtn"]').show();
  $('[id="editProxyForm"]').remove();
  $('[id="addProxyBtn"]').show();
  $('[id="addProxyForm"]').remove();
}

function addProxy() {
  chrome.runtime.sendMessage({type: "gaq", target: "Add_new_proxy_btn", behavior: "clicked"});

  closeOtherForms();

  var profileId = 'profile-' + $.now();
  $('#addProxyBtn').after('<form id="addProxyForm"><fieldset>' +
    '<legend>Add Proxy</legend>' +
    '<table align="center">' +
    '	<tr>' +
    '		<td><label id="lblProfileName">Profile Name:</label></td>' +
    '		<td><input type="text" placeholder="(placeholder)Akamai staging NonSecure" id="txtProfileName" /></td>' +
    '	</tr>' +
    '	<tr>' +
    '		<td><label id="lblProxyScheme">Scheme:</label></td>' +
    '		<td><select id="txtProxyScheme">' +
    '			<option selected value="http">http</option>' +
    '			<option value="https">https</option>' +
    '			<option value="socks4">socks4</option>' +
    '			<option value="socks5">socks5</option>' +
    '			<option value="pac">pac</option>' +
    '		</select></td>' +
    '	</tr>' +
    '	<tr>' +
    '		<td><label id="lblProxyHost">Proxy Host:</label></td>' +
    '		<td><input type="text" placeholder="www.example.edgesuite-staging.net" id="txtProxyHost" /></td>' +
    '	</tr>' +
    '	<tr>' +
    '		<td><label id="lblProxyPort">Port:</label></td>' +
    '		<td><input type="text" placeholder="(placeholder)80" id="txtProxyPort" /></td>' +
    '	</tr>' +
    '	<tr>' +
    '		<td><label id="lblProxyUsername">(Optional) Username: </label></td>' +
    '		<td><input type="text" id="txtProxyUsername" /></td>' +
    '	</tr>' +
    '	<tr>' +
    '    	<td><label id="lblProxyPassword">(Optional) Password:</label></td>' +
    '    	<td><input type="password" id="txtProxyPassword" /></td>' +
    '	</tr>' +
    /* '	<tr id="trSmart">\n'+
	    '    	<td><input type="checkbox" id="checkSmartRules" /><div id="lblRulesUrl">Smart Rules:<ul id="smartRulesTooltip"><li>Compatible with AutoProxy rules and Adblock Plus rules.</li><li>Rules are either Base64-encoded or plaintext (one rule per line).</li><li>Please fill in the rules url and select the checkbox.</li></ul></div></td>\n'+
	    '    	<td><input type="url" id="txtRulesUrl" /></td>\n'+
        '	</tr>\n'+*/
    '	<tr>' +
    '<td><a id="submitBtn" href="#flushdns" data-profileid="' + profileId + '" class="btn light-blue hoverable">Submit</a></td>' +
    //	'		<td><button type="submit" id="submitBtn" data-profileid="'+profileId+'">Save</button></td>\n'+
    '<td><a id="cancelBtn" href="#flushdns"class="btn blue-grey lighten-5 blue-grey-text text-darken-3 hoverable">Cancel</a></td>' +
    //'		<td><button id="cancelBtn">Cancel</button></td>\n'+
    '	</tr>' +
    '</table>' +
    '</fieldset></form>');
  $('#addProxyBtn').hide();
}

function saveProxy(profileId, profileName, scheme, host, port, username, password, useRules, rulesUrl) {
  if (scheme === 'pac') {
    port = username = password = rulesUrl = '';
    useRules = false;
  }

  chrome.storage.local.get(profileId, function(profileDataObj) {
    var profileData = profileDataObj[profileId];

    var profileNewData = [profileName, scheme, host, port, username, password, useRules, rulesUrl].join('|');
    if (profileNewData !== profileData) {
      var obj = {};
      obj[profileId] = profileNewData;
      chrome.storage.local.set(obj);
    }

    chrome.storage.local.get('lastProfileId', function(lastProfileIdObj) {
      var lastProfileId = lastProfileIdObj['lastProfileId'];
      if (lastProfileId === profileId) {
        setProxyWithData(false, profileNewData);
      }
    });
  });
}

function loadProxy() {
  chrome.storage.local.get(null, function(items) {
    var lastProfileId = isEmpty(items['lastProfileId']) ? 'profile-direct' : items['lastProfileId'];
    // direct profile
    var checkedStatus = (lastProfileId === 'profile-direct') ? "checked" : '';
    $('#proxyList').html('\
			<input type="radio" ' + checkedStatus + ' id="setProxyBtn_direct" data-profileid="profile-direct" /><label for="setProxyBtn_direct">Directly connect to the internet</label><hr />\
		');
    // proxy profiles
    for (key in items) {
      if (key.startsWith('profile-')) {
        var profileId = key;
        var profileData = items[key];
        if (isEmpty(profileData)) return;
        var paras = profileData.split('|');
        var checkedStatus = (lastProfileId === profileId) ? "checked" : '';
        $('#proxyList').append('<input type="radio" ' + checkedStatus + ' id="setProxyBtn_' + profileId + '" data-profileid="' + profileId + '" /><label for="setProxyBtn_' + profileId + '">' + paras[0] + '</label><a id="editProxyBtn"  data-profileid="' + profileId + '" href="#!" class="right tooltipped" data-position="left" data-tooltip="Edit this proxy setting" style="font-size: 15px;">Edit</a><hr />\
				');
      }
    }
  });
}

function setProxyWithData(isDirect, profileData) {
  if (isDirect) {
    var config = {
      mode: "direct"
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
      },
      function() {});
    return;
  }

  if (isEmpty(profileData)) return;

  var paras = profileData.split('|');

  if (paras[1] === 'pac') {
    //reset to direct
    var config = {
      mode: "direct"
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
      },
      function() {});

    //set proxy
    config = {
      mode: "pac_script",
      pacScript: {
        url: paras[2]
      }
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
      },
      function() {});

    //update icon
    chrome.browserAction.setIcon({
      path: {
        '19': '../images/icon19-running.png',
        '38': '../images/icon38-running.png'
      }
    });
  } else if (paras[6] === 'true') {
    //reset to direct
    var config = {
      mode: "direct"
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
      },
      function() {});
    //update icon
    chrome.browserAction.setIcon({
      path: {
        '19': '../images/icon19.png',
        '38': '../images/icon38.png'
      }
    });

    updateRules(paras[7], paras[1], paras[2], paras[3]);
  } else {
    //set proxy
    var config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: paras[1],
          host: paras[2],
          port: parseInt(paras[3])
        },
        bypassList: ["*.*.akamaiapis.net", "127.0.0.1/8", "*.akamai.com", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "<local>"]
      }
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
      },
      function() {});

    //update icon
    chrome.browserAction.setIcon({
      path: {
        '19': '../images/icon19-running.png',
        '38': '../images/icon38-running.png'
      }
    });

  }
}

function setProxy(profileId) {
  if (profileId === 'profile-direct') {
    setProxyWithData(true, null);
    //chrome.browserAction.setBadgeBackgroundColor({color: color});
    chrome.browserAction.setBadgeText({
      text: ''
    });
  } else {
    chrome.storage.local.get(profileId, function(profileDataObj) {
      var profileData = profileDataObj[profileId];
      setProxyWithData(false, profileData);
      var GREEN = [34, 139, 34, 255];
      var color = GREEN;
      chrome.browserAction.setBadgeBackgroundColor({
        color: color
      });
      chrome.browserAction.setBadgeText({
        text: 'ON'
      });
    });
  }
}

function updateRules(url, proxyType, proxyHost, proxyPort, tryCnt = 1) {
  //fetch rules
  $.get(url, function(data) {
    var rulesDecoded = '';
    try { //base64
      var dataRaw = data.replace('\n', '');
      rulesDecoded = atob(dataRaw);
    } catch (e) {
      //raw data
      rulesDecoded = data;
    }
    //parse
    var lines = rulesDecoded.split('\n');
    var rules = new Array();
    for (var i = 0; i < lines.length; i++) {
      var oneRule = '';
      var line = lines[i].trim();
      line = line.replace('http://', '');
      line = line.replace('https://', '');
      if (isEmpty(line) ||
        line[0] === '!' ||
        line.startsWith('@@') ||
        line.includes('[AutoProxy') ||
        !line.includes('.')) continue;
      if (line.startsWith('||'))
        oneRule = line.substr(2);
      else if (line[0] === '|')
        oneRule = line.substr(1);
      else if (line.includes('\/'))
        continue;
      else if (line[0] === '.')
        oneRule = line.substr(1);
      else
        oneRule = line;
      var pos = oneRule.indexOf('/');
      if (pos !== -1) {
        var dotpos = oneRule.indexOf('.');
        if (dotpos !== -1 && dotpos > pos)
          oneRule = oneRule.substr(dotpos + 1);
        else
          oneRule = oneRule.substr(0, pos);
      }

      oneRule = '\'' + oneRule + '\':1';
      rules.push(oneRule);
    }
    rules.push('\'naver.jp\':1');
    rules.push('\'edgesuite.net\':1');
    var domainList = rules.join(',');
    var pacProxyType = '';
    if (proxyType === 'socks4') pacProxyType = 'SOCKS';
    else if (proxyType === 'socks5') pacProxyType = 'SOCKS5';
    else pacProxyType = 'PROXY';
    var pacData = 'var proxy ="' + pacProxyType + ' ' + proxyHost + ':' + proxyPort + '; DIRECT;"\n' +
      'var direct = "DIRECT;";\n' +
      'var domains = {' + domainList + '};\n' +
      `var hasOwnProperty = Object.hasOwnProperty\n;
function FindProxyForURL(url, host) { \n
    if(isPlainHostName(host) || shExpMatch(host, "*.local")  || (/^(\\d+\\.){3}\\d+$/.test(host) && (shExpMatch(host, "10.*") || shExpMatch(host, "127.*") || shExpMatch(host, "192.168.*") || /^172\\.(1[6-9]|2[0-9]|3[0-1])\\.\\d+\\.\\d+$/.test(host)))){\n
		return direct;\n
	}
	if(/^(.*\\.?)(google|blogspot)\\.(.*)$/.test(host)){\n
		return proxy;\n
	}\n
	var suffix;\n
	var pos = host.lastIndexOf(".");\n
	pos = host.lastIndexOf(".", pos - 1);\n
    while(1) {\n
        if (pos <= 0) {\n
            if (hasOwnProperty.call(domains, host)) {\n
                return proxy;\n
            } else {\n
            	return direct;\n
            }\n
        }\n
		suffix = host.substring(pos + 1);\n
        if (hasOwnProperty.call(domains, suffix)) {\n
        	return proxy;\n
        }\n
        pos = host.lastIndexOf(".", pos - 1);\n
	}\n
}`;

    //set proxy
    var config = {
      mode: "pac_script",
      pacScript: {
        data: pacData
      }
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
      },
      function() {});

    //update icon
    chrome.browserAction.setIcon({
      path: {
        '19': '../images/icon19-running.png',
        '38': '../images/icon38-running.png'
      }
    });
  }).fail(function() {
    if (tryCnt >= 3) {
      document.body.innerHTML += '<dialog><b>Fail to fetch rules.<br />Please check the rules url and try again.</b><p></p><div align="center"><button>Close</button></div></dialog>';
      var dialog = document.querySelector('dialog');
      dialog.querySelector('button').addEventListener('click', function() {
        dialog.close();
      });
      dialog.showModal();
      return;
    } else {
      updateRules(url, proxyType, proxyHost, proxyPort, tryCnt + 1);
    }
  });
}
