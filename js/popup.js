var valueT = {};
var valueU = {};

// Config tour steps
 var tourSteps = [{
          "msg": "Welcome to Akamai Developer Toolkit. let's get you setup to make your first OPEN API call.", // tour bubble / dialog text
          "selector": "body", // selector for highlighted feature. Comma seperated list = (dialog target, additional items to pop above mask). Don't forget your '.' or '#'
          "position": "center", // dialog location in relation to target (selector). top, bottom, left, right, (or 'center' which centers to screen)
          "btnMsg": "Start Tour &raquo", 
          "exitbtnMsg": "Close Tour",// if you'd like a button on the dialog simply add a message here
          "waitForTrigger": false // should we pause the tour here? while the user does something? Pass a seletor as the trigger to resume the tour from this point
      }, {
          "msg": "Step 1: Click to add a new credential ",
              "selector": "#addnewtoken",
              "position": "bottom",
              "nextSelector": "#addnewtoken",
              "exit1btnMsg": "Close Tour"
      }, {
          "msg": "Step 2: Upload your credential file here, this is the credentials file you download from Akamai Luna control center",
              "selector": ".file-field",
              "position": "left",
              "nextSelector": "#filebutton",
              "exit1btnMsg": "Close Tour"
      }, {
          "msg": "Step 3: Enter a credential description, for example: 'GENERAL OPEN API'. Once you are complete click next",
              "selector": ".cred_description",
              "position": "top",
              "btnMsg": "next >",
              "nextSelector":"#tour_dialog_btn",
              "exitbtnMsg": "Close Tour"
      }, {
          "msg": "Step 4: Click here to save your credential",
              "selector": "#submitButton",
              "position": "top",
              "nextSelector": "#submitButton",
              "exit1btnMsg": "Close Tour"
      }, {
          "msg": "Step 5: Click on the OK button to close the popup",
              "selector": ".swal2-confirm",
              "position": "bottom",
              "nextSelector": ".swal2-confirm",
              "exit1btnMsg": "Close Tour"
      },{
        "msg": "Step 6: click here to activate your credentials across the extension",
            "selector": ".activate_token_creds",
            "position": "bottom",
            "nextSelector": ".activate_token_creds",
            "exit1btnMsg": "Close Tour"
    },{
      "msg": "Step 7: Select this credential for activation",
          "selector": "#activate_token_sidenav",
          "position": "right",
          "nextSelector": "#activate_token_sidenav",
          "exit1btnMsg": "Close Tour"
  },{
  "msg": "Step 8: Click here to access the OPEN API tester",
      "selector": "#tour_open_api",
      "position": "bottom",
      "nextSelector": "#tour_open_api",
      "exit1btnMsg": "Close Tour"
},{
  "msg": "Step 9: <b>You are all set !</b> Enter an OPEN API url endpoint below and click submit. You will find the response payload and headers for the API call in the sections below",
      "selector": ".request-section",
      "position": "top",
      "btnMsg": "done",
}
    ];

function loadDialog() {
  chrome.storage.local.get('firstTime', function(valueT) {
    valueT = valueT['firstTime'];
    valueU = valueU['updated'];
    var msg = '<b>Thank you for installing the extension!</b><br/>If you are a first time user, ';
    msg +='click the <b>start tour</b> button</a>';
    msg += ' to get a guided tour on how to add your API credentials and run your first OPEN API command. <br><b>NOTE: You will need a text file containing your credentials prior to starting the tour</b>, you can download one from Akamai Luna control center directly when you create a new credential ';
    if (valueT === 'true') {
      if (valueU !== 'true'){
      var html = '<div id="dialog" class="card light-blue lighten-5 card-alert z-depth-2">';
      html += '<div class="card-content light-blue-text card-alert-content">';
      html += '<p><a href="#!" id="loadtour" class="btn white-text light-blue">Start Tour</a></p>';
      html += '<p style="text-align: -webkit-left;">'+ msg + '</p><br>';
      html += ''
      html += '</div>';
      html += '<i id="dialog_close" class="material-icons clearmark">clear</i>';
      html += '</div>';
      var target_dom = "notification";
      $("#"+target_dom).prepend(html);
      chrome.runtime.sendMessage({type: "gaq", target: "first_time_install", behavior: "updated"});

      chrome.storage.local.set({'firstTime': 'false'});
    }
    }
  });
}

function loadUpdateDialog() {
  chrome.storage.local.get('updatedU', function(valueU) {
    valueU = valueU['updatedU'];
    //valueT = valueT['firstTime'];
   // console.log(valueU);
   // console.log(valueT);
    if (valueU === 'true') {
  
      var thisVersion = chrome.runtime.getManifest().version;
      var msg = '<b>Heads up: </b>Your extension has been autoupdated to the latest version ' + thisVersion;
        var html = '<div id="update-dialog" class="card light-blue lighten-5 card-alert z-depth-2">';
        html += '<div class="card-content light-blue-text card-alert-content">';
        html += '<i class="material-icons tiny">notifications</i>';
        html += '<p>'+ msg + '</p>';
        html += '</div>';
        html += '<i id="dialog_close" class="material-icons clearmark">clear</i>';
        html += '</div>';
        var target_dom = "notification";
        $("#"+target_dom).prepend(html);
        chrome.runtime.sendMessage({type: "gaq", target: "extension_version", behavior: "updated"});
        chrome.storage.local.set({'updatedU': 'false'});
      
    }
  });
}

function loadTwitter(){
  window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);
    t._e = [];
    t.ready = function(f) {
      t._e.push(f);
    };
    return t;
  }(document, "script", "twitter-wjs"));
  var atag = document.createElement("a");
  atag.text = "Tweet";
  atag.href = "https://twitter.com/intent/tweet?text=This%20is%20awesome%21%20I%20can%20now%20control%20and%20debug%20Akamai%20features%20directly%20from%20my%20workspace.%20Check%20out%20the%20new%20Akamai%20developer%20toolkit%20chrome%20extension%20https%3A%2F%2Fakamaidevops.page.link%2Fshare%20";
  atag.setAttribute("class", "twitter-share-button");
  atag.setAttribute("data-size", "large");
  $('.twitter-wjs').prepend(atag);
}

function ifPiezisinstalled() {
  chrome.management.get('npbccjkjemgagjioahfccljgnlkdleod', function(details) {
    if(details) {
      if(details.name === 'Piez') {
        var msg = 'Looks like you have Piez installed separately, click <a href="#!" id="removePiez" style="color: blue;"> here </a> to uninstall Piez for the optimal experience';
        var html = '<div id="piez" class="card light-blue lighten-5 card-alert z-depth-2">';
        html += '<div class="card-content light-blue-text card-alert-content">';
        html += '<i class="material-icons tiny">notifications</i>';
        html += '<p>'+ msg + '</p>';
        html += '</div>';
        html += '<i id="piez_close" class="material-icons clearmark">clear</i>';
        html += '</div>';
        var target_dom = "piez-notification";
        $("#"+target_dom).prepend(html);
      }
    }
  });
}


$(document).ready(function() {


  $('select').material_select();
  $('.initialized').hide(); // materialize bug
 // $('.fixed-action-btn').floatingActionButton();
 $('.button-collapse').sideNav({
  menuWidth: 400, // Default is 300
  edge: 'left', // Choose the horizontal origin
  closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
  draggable: true // Choose whether you can drag to open on touch screens
}
);

$(document).on('click', '#dialog_close', function(){
  $("#notification").empty();
});

$(document).on('click', '#piez_close', function(){
  $("#piez-notification").empty();
});


$(document).on('click', '#sidenavbutton', function(){
  // START OPEN
  $('.button-collapse').sideNav('show');
});


//listener for response details
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg === "openapi_response_completed") {
            $('.openapiresults-js').empty();
            $('.openapiresults-js').append(request.data.content);

        }
    }
);
//listener for response payload
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg === "openapi_response_payload"){
      $('.openapiresppayload-js').empty();
      $('.openapiresppayload-js').append(request.data.content);
      console.log('response_payload msg recieved');
    }
  }
);

//listener for successfull OPEN API request
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg === "openapi_notfify"){
      $('.responsestatus-js').empty();
      $('.responsestatus-js').append(request.data.content);
      console.log('response_status msg recieved');
    }
  }
);

//listener for response headers
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg === "openapi_response_headers"){
      $('.openapirespheaders-js').empty();
      $('.openapirespheaders-js').append(request.data.content);
      console.log('response_headers msg recieved');
    }
  }
);
//listener for request payload
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg === "openapi_request_payload"){
      $('.openapireqpayload-js').empty();
      $('.openapireqpayload-js').append(request.data.content);
      console.log('response_headers msg recieved');
    }
  }
);

//listener for response time
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg === "openapi_response_time"){
      $('.responsetime-js').empty();
      $('.responsetime-js').append(request.data.content);
      console.log('response_time msg recieved');
    }
  }
);


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.msg === "cred_mismatch_nocreds") {
          //  To do something
          $('.openapiresults-js').empty();
      }
  }
);

//refreshing history list while requests are being made
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.msg === "reload_history") {
        addRecordintoHistory();
          //  To do something
       //   $("#historylist").empty();
      //    $("#historylist").load(location.href + " #historylist");


      }
  }
);


  chrome.runtime.sendMessage({type: "gaq", target: "Popup_page", behavior: "loaded"});
  $('.versionNumber').attr("data-badge-caption", "v" + chrome.runtime.getManifest().version);
  loadCredentialList();
  loadActiveCredentiallist();
  //loadProxy();
  loadTwitter();
  ifPiezisinstalled();
  loadDialog();
  loadUpdateDialog();
 


  $(document).on('click', '#addProxyBtn', addProxy);
  $(document).on('click', '#flushdns', function() {
    chrome.runtime.sendMessage({type: "gaq", target: "flushdns", behavior: "clicked"});
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
    chrome.runtime.sendMessage({type: "gaq", target: "Add_new_proxy_savebtn", behavior: "clicked"});

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
    chrome.runtime.sendMessage({type: "gaq", target: "Edit_existing_proxy_btn", behavior: "clicked"});

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
    chrome.runtime.sendMessage({type: "gaq", target: "saving_edits_in_existing_proxy_form", behavior: "clicked"});

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
    chrome.runtime.sendMessage({type: "gaq", target: "cancelling_edits_in_existing_proxy_form", behavior: "clicked"});
    $('#editProxyForm').prev('#editProxyBtn').show();
    $('#editProxyForm').remove();
  });


/*
  $(document).on('click', '#loadgettingstartedvideo', function() {
    chrome.runtime.sendMessage({type: "gaq", target: "View_getting_started_video", behavior: "clicked"});
    chrome.tabs.create({
      url: 'https://www.youtube.com/watch?v=6PhU7lwOqHM'
    });
  });
*/

  $(document).on('click', '#loadtour', function() {
    chrome.runtime.sendMessage({type: "gaq", target: "View_getting_started_tour", behavior: "clicked"});
    $('#notification').empty().hide();
    jQuery.tour(tourSteps);
  });




  $(document).on('click', '#removePiez', function() {
    chrome.runtime.sendMessage({type: "gaq", target: "Original_piez_user_uninstalled", behavior: "clicked"});
    chrome.management.uninstall('npbccjkjemgagjioahfccljgnlkdleod');
    $("#piez-notification").empty();
  });
/*
  $(document).on('click', '#editProxyForm #deleteProxyBtn', function() {
    chrome.runtime.sendMessage({type: "gaq", target: "deleting_edits_in_existing_proxy_form", behavior: "clicked"});

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
 */ 

  $('.userguide').click(function() {
    chrome.runtime.sendMessage({type: "gaq", target: "User_guide_clicked", behavior: "clicked"});
    chrome.tabs.create({
      url: 'https://developer.akamai.com/tools/akamai-toolkit-chrome'
    });
  });

  /*
  $('#apicredstutorial').click(function(){
    chrome.runtime.sendMessage({type: "gaq", target: "View_api_creds_tutorial", behavior: "clicked"});
		chrome.tabs.create({url: 'https://youtu.be/6PhU7lwOqHM'});
	});

  $('#fastpurgetutorial').click(function(){
    chrome.runtime.sendMessage({type: "gaq", target: "View_fast_purge_tutorial", behavior: "clicked"});
    chrome.tabs.create({url: 'https://youtu.be/kk9RDQaARxw'});
  });

  $('#reload').click(function(){
    window.location.href="popup.html#testing";
    console.log('click registered');
   });

  $('#debugtutorial').click(function(){
    chrome.runtime.sendMessage({type: "gaq", target: "View_debug_reqests_tutorial", behavior: "clicked"});
    chrome.tabs.create({url: 'https://youtu.be/8NW0M7PyW68'});
  });

  $('#browsersettingstutorial').click(function(){
    chrome.runtime.sendMessage({type: "gaq", target: "View_browser_settings_tutorial", behavior: "clicked"});
    chrome.tabs.create({url: 'https://youtu.be/YZsaQZzMtmM'});
  });
  */

 $('#feedbackform, #feedbackformlink').click(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "View_feedback_form", behavior: "clicked"});
  chrome.tabs.create({
    url: 'https://goo.gl/forms/7ZaZ7XMATVQ8xEyu1'
  });
});

  $('#devpopssignuplink').click(function(){
    chrome.runtime.sendMessage({type: "gaq", target: "DevPoPs Sign Up Link", behavior: "clicked"});
    chrome.tabs.create({url: 'http://bit.ly/devpops18'});
  });
  $('#reportbugs').click(function(){
    chrome.runtime.sendMessage({type: "gaq", target: "Report Bug", behavior: "clicked"});
    chrome.tabs.create({url: 'https://github.com/akamai/akamai_developer_toolkit/issues'});
  });
});
