/*
 * Adding google analytics to track only clicks within the extension, 
 * this will help us improve services that are most used, feel free to email ajayapra@akamai.com in case 
 * you would like to get a non-analytics version of our extension
 * Source https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/tutorials/analytics/popup.js
 */

// dev analytics tracker 
// var _AnalyticsCode = 'UA-116652320-3';
var _AnalyticsCode = 'UA-116652320-3';

var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === "gaq") {
    _gaq.push(['_trackEvent', message.target, message.behavior]);
    console.log("Tracking Event - " + message.target + " : " + message.behavior);
  }
});
