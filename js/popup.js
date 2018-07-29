chrome.runtime.getBackgroundPage(function(backgroundpage) {
  backgroundpage._gaq.push(['_trackEvent', 'Popup_page', 'loaded']);
});

function loadCredentialList() {
  $('#tokenlist').empty().hide();
  chrome.storage.local.get('tokens', function(data) {
    var arr_tokens = data['tokens'];
    if (typeof arr_tokens === 'undefined' || arr_tokens === null) {
      arr_tokens = [];
    }
    if (arr_tokens.length > 0) {
      for (i = 0; i < arr_tokens.length; i++) {
        var api_credential = arr_tokens[i];
        var list_html = '<li class="collection-item avatar disabled">';
        list_html += '<i class="material-icons key-img circle teal lighten-2 z-depth-1" style="display: none;">lock_open</i>';
        list_html += '<span class="center" style="font-size: 15px;">' + api_credential.desc + '</span>';
        list_html += '<p>' + api_credential.tokentype + '</p>';
        list_html += '<p class="blue-grey-text">Click on Activate to enable this credential for your requests</p>';
        list_html += '<div class="secondary-content">';
        list_html += '<div><a id="token-activate" href="#!" tokenid="' + api_credential.uniqid + '" action="activate">Activate</a></div>';
        list_html += '<div><a id="token-edit" href="#!" tokenid="' + api_credential.uniqid + '" action="edit">Edit</a></div>';
        list_html += '<div><a id="token-delete" href="#!" tokenid="' + api_credential.uniqid + '" action="delete">Delete</a></div>';
        list_html += '</div></li>';
        $('#tokenlist').append(list_html);
      }
      // if (arr_tokens.length == 1) {$('#token-activate').trigger('click')};
      $("#apitab-nocredential").hide();
      $('#tokenlist').show();
    } else {
      $("#apitab-nocredential").show();
      return false;
    }
  });
}

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

  chrome.storage.sync.get(null, function(items) {
    chrome.storage.local.set(items);
  });

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

chrome.storage.onChanged.addListener(function(changes, namespace) {
  var storageToBeChanged = namespace === 'local' ? chrome.storage.sync : chrome.storage.local;
  for (key in changes) {
    var storageChange = changes[key];
    if (isEmpty(storageChange.newValue)) {
      storageToBeChanged.remove(key);
    } else {
      var obj = {};
      obj[key] = storageChange.newValue;
      storageToBeChanged.set(obj);
    }
  }
});

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
  chrome.runtime.getBackgroundPage(function(backgroundpage) {
    backgroundpage._gaq.push(['_trackEvent', 'Add_new_proxy_btn', 'clicked']);
  });

  closeOtherForms();

  var profileId = 'profile-' + $.now();
  $('#addProxyBtn').after('<form id="addProxyForm"><fieldset>\n' +
    '<legend>Add Proxy</legend>\n' +
    '<table align="center">\n' +
    '	<tr>\n' +
    '		<td><label id="lblProfileName">Profile Name:</label></td>\n' +
    '		<td><input type="text" placeholder="(placeholder)Akamai staging NonSecure" id="txtProfileName" /></td>\n' +
    '	</tr>\n' +
    '	<tr>\n' +
    '		<td><label id="lblProxyScheme">Scheme:</label></td>\n' +
    '		<td><select id="txtProxyScheme">\n' +
    '			<option selected value="http">http</option>\n' +
    '			<option value="https">https</option>\n' +
    '			<option value="socks4">socks4</option>\n' +
    '			<option value="socks5">socks5</option>\n' +
    '			<option value="pac">pac</option>\n' +
    '		</select></td>\n' +
    '	</tr>\n' +
    '	<tr>\n' +
    '		<td><label id="lblProxyHost">Proxy Host:</label></td>\n' +
    '		<td><input type="text" placeholder="www.example.edgesuite-staging.net" id="txtProxyHost" /></td>\n' +
    '	</tr>\n' +
    '	<tr>\n' +
    '		<td><label id="lblProxyPort">Port:</label></td>\n' +
    '		<td><input type="text" placeholder="(placeholder)80" id="txtProxyPort" /></td>\n' +
    '	</tr>\n' +
    '	<tr>\n' +
    '		<td><label id="lblProxyUsername">(Optional) Username: </label></td>\n' +
    '		<td><input type="text" id="txtProxyUsername" /></td>\n' +
    '	</tr>\n' +
    '	<tr>\n' +
    '    	<td><label id="lblProxyPassword">(Optional) Password:</label></td>\n' +
    '    	<td><input type="password" id="txtProxyPassword" /></td>\n' +
    '	</tr>\n' +
    /* '	<tr id="trSmart">\n'+
	    '    	<td><input type="checkbox" id="checkSmartRules" /><div id="lblRulesUrl">Smart Rules:<ul id="smartRulesTooltip"><li>Compatible with AutoProxy rules and Adblock Plus rules.</li><li>Rules are either Base64-encoded or plaintext (one rule per line).</li><li>Please fill in the rules url and select the checkbox.</li></ul></div></td>\n'+
	    '    	<td><input type="url" id="txtRulesUrl" /></td>\n'+
        '	</tr>\n'+*/
    '	<tr>\n' +
    '<td><a id="submitBtn" href="#flushdns" data-profileid="' + profileId + '" class="btn light-blue hoverable">Submit</a></td>\n' +
    //	'		<td><button type="submit" id="submitBtn" data-profileid="'+profileId+'">Save</button></td>\n'+
    '<td><a id="cancelBtn" href="#flushdns"class="btn blue-grey lighten-5 blue-grey-text text-darken-3 hoverable">Cancel</a></td>\n' +
    //'		<td><button id="cancelBtn">Cancel</button></td>\n'+
    '	</tr>\n' +
    '</table>\n' +
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

function isEmpty(val) {
  return val === null || val === '' || jQuery.isEmptyObject(val);
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

$(document).ready(function() {
  loadCredentialList();
  loadProxy();

  $(document).on('click', '#addProxyBtn', addProxy);
  $(document).on('click', '#flushdns', function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'flushdns', 'clicked']);
    });
    chrome.tabs.query({}, function(tabs) {
      var needCreate = true;
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url == 'chrome://net-internals/#dns') {
          chrome.tabs.executeScript(tabs[i].id, {
            file: "js/flush.js"
          });
          needCreate = false;
          break;
        }
      }
      if (needCreate) {
        chrome.tabs.create({
          url: 'chrome://net-internals/#dns',
          active: false
        }, function(tab) {
          chrome.tabs.executeScript(tab.id, {
            file: "js/flush.js"
          });
        });
      }
    });
  });

  $(document).on('click', '#setProxyBtn', function() {
    var profileId = $(this).data('profileid');
    setProxy(profileId);
    chrome.storage.local.set({
      'lastProfileId': profileId
    }, function() {
      loadProxy();
    });
  });

  $(document).on('click', '[id^=setProxyBtn_]', function() {
    var profileId = $(this).data('profileid');
    setProxy(profileId);
    chrome.storage.local.set({
      'lastProfileId': profileId
    }, function() {
      loadProxy();
    });
  });

  $(document).on('click', '#setProxyBtn_direct', function() {
    var profileId = $(this).data('profileid');
    setProxy(profileId);
    chrome.storage.local.set({
      'lastProfileId': profileId
    }, function() {
      loadProxy();
    });
  });

  $(document).on('click', '#addProxy #submitBtn', function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'Add_new_proxy_savebtn', 'clicked']);
    });

    var profileId = $(this).data('profileid');
    var profileName = $('#txtProfileName').prop('value');
    var proxyScheme = $('#txtProxyScheme').prop('value');
    var proxyHost = $('#txtProxyHost').prop('value');
    var proxyPort = $('#txtProxyPort').prop('value');
    var proxyUsername = $('#txtProxyUsername').prop('value');
    var proxyPassword = $('#txtProxyPassword').prop('value');
    var useRules = $('#checkSmartRules').is(':checked');
    var rulesUrl = $('#txtRulesUrl').prop('value');

    if (isEmpty(profileName)) {
      alert('Profile name cannot be emtpy!');
      return;
    }
    if (proxyScheme === 'pac') {
      if (isEmpty(proxyHost)) {
        alert('PAC URL cannot be empty!');
        return;
      }

    } else if (isEmpty(proxyHost)) {
      alert('Proxy host cannot be empty!');
      return;
    } else if (isEmpty(proxyPort)) {
      alert('Proxy port cannot be empty!');
      return;
    }

    $('#addProxyBtn').show();
    $('#addProxyForm').remove();

    saveProxy(profileId, profileName, proxyScheme, proxyHost, proxyPort, proxyUsername, proxyPassword, useRules, rulesUrl);
    window.location.reload(true);
  });

  $(document).on('click', '#addProxy #cancelBtn', function() {
    $('#addProxyBtn').show();
    $('#addProxyForm').remove();
  });

  $(document).on('change', '#txtProxyScheme', function() {
    if (this.value === 'pac') {
      $('#lblProxyHost').text('PAC URL:');
      $('#txtProxyHost').prop('type', 'url');
      $('#lblProxyPort').hide();
      $('#txtProxyPort').hide();
      $('#lblProxyUsername').hide();
      $('#txtProxyUsername').hide();
      $('#lblProxyPassword').hide();
      $('#txtProxyPassword').hide();
      $('#trSmart').hide();
    } else {
      $('#lblProxyHost').text('Proxy Host:');
      $('#txtProxyHost').prop('type', 'text');
      $('#lblProxyPort').show();
      $('#txtProxyPort').show();
      $('#lblProxyUsername').show();
      $('#txtProxyUsername').show();
      $('#lblProxyPassword').show();
      $('#txtProxyPassword').show();
      $('#trSmart').show();
    }
  });

  $(document).on('click', '#proxyList #editProxyBtn', function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'Edit_existing_proxy_btn', 'clicked']);
    });

    closeOtherForms();

    var profileId = $(this).data('profileid');
    var currNode = $(this);
    chrome.storage.local.get(profileId, function(profileDataObj) {
      var profileData = profileDataObj[profileId];
      if (isEmpty(profileData)) return;

      var paras = profileData.split('|');
      currNode.after('<form id="editProxyForm"><fieldset>\n' +
        '<legend>Edit Proxy</legend>\n' +
        '<table align="center">\n' +
        '<tr>\n' +
        '	<td><label id="lblProfileName">Profile Name:</label></td>\n' +
        '	<td><input type="text" id="txtProfileName" value="' + paras[0] + '" /></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '	<td><label id="lblProxyScheme">Scheme:</label></td>\n' +
        '	<td><select id="txtProxyScheme">\n' +
        '		<option ' + (paras[1] === 'http' ? 'selected' : '') + ' value="http">http</option>\n' +
        '		<option ' + (paras[1] === 'https' ? 'selected' : '') + ' value="https">https</option>\n' +
        '		<option ' + (paras[1] === 'socks4' ? 'selected' : '') + ' value="socks4">socks4</option>\n' +
        '		<option ' + (paras[1] === 'socks5' ? 'selected' : '') + ' value="socks5">socks5</option>\n' +
        '		<option ' + (paras[1] === 'pac' ? 'selected' : '') + ' value="pac">pac</option>\n' +
        '	</select></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '    <td><label id="lblProxyHost">Proxy Host:</label></td>\n' +
        '    <td><input type="text" id="txtProxyHost" value="' + paras[2] + '" /></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '	<td><label id="lblProxyPort">Port:</label></td>\n' +
        '	<td><input type="text" id="txtProxyPort" value="' + paras[3] + '" /></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '	<td><label id="lblProxyUsername">(Optional) Username:</label></td>\n' +
        '	<td><input type="text" id="txtProxyUsername" value="' + paras[4] + '" /></td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '	<td><label id="lblProxyPassword">(Optional) Password:</label></td>\n' +
        '	<td><input type="password" id="txtProxyPassword" value="' + paras[5] + '" /></td>\n' +
        '</tr>\n' +
        //'<tr id="trSmart">\n'+
        // '	<td><input type="checkbox" id="checkSmartRules" '+(paras[6] === 'true'?'checked':'')+'/><div id="lblRulesUrl">Smart Rules:<ul id="smartRulesTooltip"><li>Compatible with AutoProxy rules and Adblock Plus rules.</li><li>Rules are either Base64-encoded or plaintext (one rule per line).</li><li>Please fill in the rules url and select the checkbox.</li></ul></div></td>\n'+
        // '	<td><input type="url" id="txtRulesUrl" value="'+(isEmpty(paras[7])?'':paras[7])+'" /></td>\n'+
        // '</tr>\n'+
        '<tr>\n' +
        '<td><a id="submitBtn" href="#flushdns" data-profileid="' + profileId + '" class="btn light-blue hoverable">Save</a></td>\n' +
        '<td><a id="cancelBtn" href="#flushdns"class="btn blue-grey lighten-5 blue-grey-text text-darken-3  hoverable">Cancel</a>&nbsp;&nbsp;\n' +

        '<a id="deleteProxyBtn" href="#flushdns" data-profileid="' + profileId + '" class="btn blue-grey lighten-5 blue-grey-text text-darken-3 hoverable">Delete</a></td>\n' +

        '</tr>\n' +
        '</table>\n' +
        '</fieldset></form>');
      $('#txtProxyScheme').trigger('change');
      currNode.hide();
    });
  });

  $(document).on('click submit', '#editProxyForm #submitBtn', function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'saving_edits_in_existing_proxy_form', 'clicked']);
    });

    var profileId = $(this).data('profileid');
    var profileName = $('#txtProfileName').prop('value');
    var proxyScheme = $('#txtProxyScheme').prop('value');
    var proxyHost = $('#txtProxyHost').prop('value');
    var proxyPort = $('#txtProxyPort').prop('value');
    var proxyUsername = $('#txtProxyUsername').prop('value');
    var proxyPassword = $('#txtProxyPassword').prop('value');
    var useRules = $('#checkSmartRules').is(':checked');
    var rulesUrl = $('#txtRulesUrl').prop('value');

    if (isEmpty(profileName)) {
      alert('Profile name cannot be emtpy!');
      return;
    }
    if (proxyScheme === 'pac') {
      if (isEmpty(proxyHost)) {
        alert('PAC URL cannot be empty!');
        return;
      }
    } else if (isEmpty(proxyHost)) {
      alert('Proxy host cannot be empty!');
      return;
    } else if (isEmpty(proxyPort)) {
      alert('Proxy port cannot be empty!');
      return;
    }

    $('#editProxyForm').prev('#editProxyBtn').prev('label').text(profileName);
    $('#editProxyForm').prev('#editProxyBtn').show();
    $('#editProxyForm').remove();

    saveProxy(profileId, profileName, proxyScheme, proxyHost, proxyPort, proxyUsername, proxyPassword, useRules, rulesUrl);
  });

  $(document).on('click', '#editProxyForm #cancelBtn', function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'cancelling_edits_in_existing_proxy_form', 'clicked']);
    });
    $('#editProxyForm').prev('#editProxyBtn').show();
    $('#editProxyForm').remove();
  });

  $(document).on('click', '#editProxyForm #deleteProxyBtn', function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'deleting_edits_in_existing_proxy_form', 'clicked']);
    });

    var profileId = $(this).data('profileid');
    chrome.storage.local.get('lastProfileId', function(lastProfileIdObj) {
      var lastProfileId = lastProfileIdObj['lastProfileId'];
      if (lastProfileId === profileId) {
        chrome.storage.local.set({
          'lastProfileId': 'profile-direct'
        });
      }
      chrome.storage.local.remove(profileId, function() {
        $('#editProxyForm').remove();
        loadProxy();
      });
    });
  });

  // Mark active token
  chrome.storage.local.get('active_token', function(data) {
    var active_token = data['active_token'];
    if (typeof active_token != 'undefined' || active_token != null) {
      $("a[tokenid='" + active_token.uniqid + "'][action='activate']").trigger('click');
    }
  });

  chrome.storage.local.get('update_type', function(data) {
    var type = data['update_type'];
    if (typeof type == 'undefined' || type == null) {
      chrome.storage.local.set({
        update_type: 'invalidate'
      }, function() {
        $("#updatetype-switch").prop('checked', false);
      });
    }
    $("#updatetype-switch").prop('checked', (type == 'invalidate') ? false : true);
  });

  chrome.storage.local.get('update_type_debug', function(data) {
    var type = data['update_type_debug'];
    //console.log("Get type: " + type);
    if (typeof type == 'undefined' || type == null) {
      chrome.storage.local.set({
        update_type_debug: 'OFF'
      }, function() {
        $("#updatetype-debugheaders").prop('checked', false);
      });
    }
    $("#updatetype-debugheaders").prop('checked', (type == 'OFF') ? false : true);
  });

  $("#updatetype-switch").change(function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'toggle_purge_type', 'clicked']);
    });

    var type = $(this).prop("checked") ? "delete" : "invalidate";
    chrome.storage.local.set({
      update_type: type
    });
  });


  $("#updatetype-debugheaders").change(function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'toggle_debug_headers', 'clicked']);
    });

    var type = $(this).prop("checked") ? "ON" : "OFF";
    chrome.storage.local.set({
      update_type_debug: type
    }, function() {
      console.log("type: " + type);
      chrome.tabs.query({}, function(tabs) {
        var needCreate = true;
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].url == 'chrome://net-internals/#dns') {
            chrome.tabs.executeScript(tabs[i].id, {
              file: "js/socketflush.js"
            });
            needCreate = false;
            break;
          }
        }

        if (needCreate) {
          chrome.tabs.create({
            url: 'chrome://net-internals/#dns',
            active: false
          }, function(tab) {
            chrome.tabs.executeScript(tab.id, {
              file: "js/socketflush.js"
            });
          });
        }
      });
    });
  });

  $('#deletealltoken').click(function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'Delete_all_tokens', 'clicked']);
    });
    chrome.storage.local.remove(['tokens', 'active_token']);
    $("#tokenlist").hide();
    $("#apitab-nocredential").show();
  });

  $('#addnewtoken, #addnewtokenlink').click(function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'Add_new_credential', 'clicked']);
    });
    chrome.tabs.create({
      url: 'credential.html'
    });
  });

  $('#purgehistorydetails, #purgehistorydetailslink').click(function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'View_purge_history', 'clicked']);
    });
    chrome.tabs.create({
      url: 'purge-history.html'
    });
  });

  $('#debughistorydetails, #debughistorydetailslink').click(function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'View_debug_history', 'clicked']);
    });
    chrome.tabs.create({
      url: 'debug-history.html'
    });
  });

  $('#feedbackform, #feedbackformlink').click(function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'View_feedback_form', 'clicked']);
    });
    chrome.tabs.create({
      url: 'https://goo.gl/forms/7ZaZ7XMATVQ8xEyu1'
    });
  });

  $('#apicredstutorial').click(function(){
		chrome.runtime.getBackgroundPage(function (backgroundpage){
			backgroundpage._gaq.push(['_trackEvent', 'View_api_creds_tutorial', 'clicked']);
		});
		chrome.tabs.create({url: 'https://youtu.be/6PhU7lwOqHM'});
	});

  $('#fastpurgetutorial').click(function(){
    chrome.runtime.getBackgroundPage(function (backgroundpage){
      backgroundpage._gaq.push(['_trackEvent', 'View_fast_purge_tutorial', 'clicked']);
    });
    chrome.tabs.create({url: 'https://youtu.be/kk9RDQaARxw'});
  });

  $('#debugtutorial').click(function(){
    chrome.runtime.getBackgroundPage(function (backgroundpage){
      backgroundpage._gaq.push(['_trackEvent', 'View_debug_reqests_tutorial', 'clicked']);
      });
    chrome.tabs.create({url: 'https://youtu.be/8NW0M7PyW68'});
  });

  $('#browsersettingstutorial').click(function(){
    chrome.runtime.getBackgroundPage(function (backgroundpage){
      backgroundpage._gaq.push(['_trackEvent', 'View_browser_settings_tutorial', 'clicked']);
      });
    chrome.tabs.create({url: 'https://youtu.be/YZsaQZzMtmM'});
  });

  $('#submitButton-stg, #submitButton-pro').click(function(obj) {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'Submit_purge_req', 'clicked']);
    });
    var arr_purge_targets = $('#purgeurls').val().split("\n");
    var network = $(this).attr('network');
    for (i = 0; i < arr_purge_targets.length; i++) {
      arr_purge_targets[i] = arr_purge_targets[i].trim().replace(/\s+/g, '');
    }
    if (arr_purge_targets.filter(Boolean).length == 0) {
      Materialize.toast('Please enter Cpcode/Tag/URL to purge', 1500);
      return false;
    } else {
      var submit_buttons = $('#submitButton-stg, #submitButton-pro');
      var this_obj = $(this);
      var this_html = $(this).html();
      submit_buttons.addClass("disabled");
      this_obj.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
      chrome.runtime.getBackgroundPage(function(backgroundpage) {
        backgroundpage.makePurgeRequest(arr_purge_targets.filter(Boolean), network, function(request_result) {
          submit_buttons.removeClass("disabled").blur();
          this_obj.html(this_html);
        });
      });
    }
  });

  $(document).on('click', '.see-more-link', function(obj) {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'Purge_see_more_link', 'clicked']);
    });
    chrome.tabs.create({
      url: 'purgedetails.html?id=' + $(this).attr('requestId')
    });
  });


  $(document).on('click', '#tokenlist li a', function(event) {
    var button_type = $(this).attr('action');
    var token_id = $(this).attr('tokenid');

    switch (button_type) {
      case "edit":
        chrome.tabs.create({
          url: 'credential.html?id=' + token_id
        });
        chrome.runtime.getBackgroundPage(function(backgroundpage) {
          backgroundpage._gaq.push(['_trackEvent', 'Editing_an_api_token', 'clicked']);
        });
        break;
      case "delete":
        $(this).closest("li.avatar").fadeOut("normal", function() {
          $(this).remove();
        });
        chrome.runtime.getBackgroundPage(function(backgroundpage) {
          backgroundpage._gaq.push(['_trackEvent', 'Deleting_an_api_token', 'clicked']);
        });
        chrome.storage.local.get(['tokens', 'active_token'], function(data) {
          var arr_tokens = data['tokens'];
          var active_token = data['active_token'];
          var token_index_to_delete = 0;
          for (var i = 0; i < arr_tokens.length; i++) {
            if (arr_tokens[i].uniqid == token_id) {
              token_index_to_delete = i;
            }
            // delete token == current active token
            if (active_token != null || typeof active_token != 'undefined') {
              if (token_id == active_token.uniqid) {
                chrome.storage.local.remove('active_token');
              }
            }
          }
          arr_tokens.splice(token_index_to_delete, 1);
          chrome.storage.local.set({
            'tokens': arr_tokens
          });
          if (arr_tokens.length == 0) {
            loadCredentialList();
          }
        });
        break;
      case "activate":
        $(".key-img").hide();
        $(this).closest("li.avatar").find(".key-img").fadeToggle();
        $('.collection-item.avatar').addClass("disabled");
        $(this).closest("li.avatar").removeClass("disabled");
        chrome.runtime.getBackgroundPage(function(backgroundpage) {
          backgroundpage._gaq.push(['_trackEvent', 'Activating_an_api_token', 'clicked']);
        });
        chrome.storage.local.get('tokens', function(tokens) {
          var arr_tokens = tokens['tokens'];
          for (var i = 0; i < arr_tokens.length; i++) {
            if (arr_tokens[i].uniqid == token_id) {
              updateActiveToken(arr_tokens[i]);
              break;
            }
          }
        });
        break;
      default:
        break;
    }
  });

  $('#debugdata').click(function() {
    chrome.runtime.getBackgroundPage(function(backgroundpage) {
      backgroundpage._gaq.push(['_trackEvent', 'Fetch_logs', 'clicked']);
    });
    // _gaq.push(['_trackEvent', 'Fetch_logs', 'clicked']);

    var arr_target_debugdata = $('#debugurls').val().split("\n");
    var arr_target_ghostIP = $('#ghostIp').val().split("\n");
    var submit_buttons = $('#debugdata');

    //enter code to differentiate between error code and request ID
    //throws error when nothing is entered
    if (arr_target_debugdata.filter(Boolean).length == 0) {
      Materialize.toast('Please enter valid error codes or request ID', 1500);
      return false;
    } else {
      var this_obj = $(this);
      var this_html = $(this).html();
      submit_buttons.addClass("disabled");
      this_obj.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
      chrome.runtime.getBackgroundPage(function(backgroundpage) {
        backgroundpage.makeErrorRefReq(arr_target_debugdata.filter(Boolean), arr_target_ghostIP.filter(Boolean), function(request_result) {
          submit_buttons.removeClass("disabled").blur();
          this_obj.html(this_html);
        });
      });
    }
  });


//piez config
document.getElementById("piez-off").onclick = function() {
  //console.log ('clicked on disabled piez');
  chrome.runtime.sendMessage({
    type: "piez-off"
  });
};

document.getElementById("piez-im-simple").onclick = function() {
  chrome.runtime.sendMessage({
    type: "piez-im-simple"
  });
};

document.getElementById("piez-im-advanced").onclick = function() {
  chrome.runtime.sendMessage({
    type: "piez-im-advanced"
  });
};

document.getElementById("piez-a2").onclick = function() {
  chrome.runtime.sendMessage({
    type: "piez-a2"
  });
};

document.getElementById("piez-ro-simple").onclick = function() {
  chrome.runtime.sendMessage({
    type: "piez-ro-simple"
  });
};

document.getElementById("piez-ro-advanced").onclick = function() {
  chrome.runtime.sendMessage({
    type: "piez-ro-advanced"
  });
};

document.getElementById("piez-3pm").onclick = function() {
  chrome.runtime.sendMessage({
    type: "piez-3pm"
  });
};

var setFormField = function(piezSettings) {
  chrome.storage.local.get("piezCurrentState", function(result) {
    document.getElementById(result["piezCurrentState"]).checked = true;
  });
};

setFormField();
});

