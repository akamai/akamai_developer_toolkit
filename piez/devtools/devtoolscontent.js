var piezController = {};
piezController.current_page = new Page();
chrome.storage.local.get('piezCurrentState', function(result) {
	piezController.current_display_mode = result['piezCurrentState'] || 'piezModeImSimple';
	showSummaryTable(piezController.current_display_mode); //choose correct summary header before page actually loads
});
var port = chrome.runtime.connect({name:'piez'});

function parseResponse(http_transaction) {
	parseHeaders(http_transaction, piezController.current_page, piezController.current_display_mode);
	report(piezController.current_page, piezController.current_display_mode);
}

function newPageRequest(url) {
	hideDetails(piezController.current_display_mode);
	piezController.current_page = new Page();
	port.postMessage({
		type: "update-piez-analytics"
	});
	chrome.storage.local.get('piezCurrentState', function(result) {
		piezController.current_display_mode = result['piezCurrentState'] || 'piezModeImSimple';
		if (piezController.current_display_mode === 'piez-a2') {
			piezController.current_page.a2Started = true;
			displayA2Loading(piezController.current_page, piezController.current_display_mode);
			port.postMessage({type:'a2PageLoad'});
		}
	});
}

window.onload = function() {
	port.postMessage({type:'inspectedTab', tab: chrome.devtools.inspectedWindow.tabId});
	chrome.devtools.network.onRequestFinished.addListener(parseResponse);
	chrome.devtools.network.onNavigated.addListener(newPageRequest);
};


port.onMessage.addListener(function(message) {
	switch(message.type) {
		case 'a2PageLoaded':
			chrome.devtools.network.getHAR(function(har) {
				piezController.current_page.pageLoaded = true;
				if (piezController.current_display_mode === 'piez-a2') {
					parsePageA2(har, piezController.current_page);
				}
				report(piezController.current_page, piezController.current_display_mode);
			});
			break;
		default:
			console.log('unexpected message on background port: ', message);
			break;
	}
});
