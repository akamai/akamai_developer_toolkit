chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === "notification") {
    var views = chrome.extension.getViews({type: "popup"});
    if (views.length > 0) {
      var popup = views[0];
      var html = '<div id="'+ message.id + '" class="card light-blue lighten-5 card-alert z-depth-2">';
      html += '<div class="card-content light-blue-text card-alert-content">';
      html += '<i class="material-icons tiny">notifications</i>';
      html += '<p>'+ message.body + '</p>';
      html += '</div>';
      html += '<i id="'+ message.id + '_close" class="material-icons clearmark">clear</i>';
      html += '</div>';
      var target_dom = message.update_target === undefined ? "notification" : message.update_target;
      popup.$("#"+target_dom).prepend(html);
      popup.$("#"+message.id+"_close").on("click", function(){
        popup.$("#"+message.id).slideUp();
      });
    }
  }
});
