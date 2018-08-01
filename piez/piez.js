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
