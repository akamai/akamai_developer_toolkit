var link = document.createElement('link');
link.href = chrome.extension.getURL("css/HoldOn.min.css");
link.rel = "stylesheet";
link.type = "text/css";
link.id = "inject";

if ($("#inject").length == 0) {
  $("body").append(link);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "open") {
    HoldOn.open({
      theme:"sk-fading-circle",
      textColor:"white",
      message:'Requesting Purge..'
    });
  } else {
    HoldOn.close(); 
  }
});
