(function(global) {
	'use strict';

	global.parseHeaders = function(http_transaction, page, display_mode) {
		if (display_mode === 'piez-a2') { //A2 does parsing separate from this
			return;
		}
		if (/x-im-original-size/i.test(JSON.stringify(http_transaction.response.headers))) {
			page.totalIMImagesTransformed += 1;
			parseImHeaders(http_transaction, page, display_mode);
		}
		// Real Time IM and IC
		else if (/x-image-server-original-size/i.test(JSON.stringify(http_transaction.response.headers))) {
			page.totalICImagesTransformed += 1;
			parseIcHeaders(http_transaction, page);
		}
		else if (/X-Akam-SW-Deferred/i.test(JSON.stringify(http_transaction.response.headers))) {
			page.total3PmDeferred += 1;
			parse3PmHeaders(http_transaction, page);
		}
		else if (/X-Akam-SW-SPOF-Protected/i.test(JSON.stringify(http_transaction.response.headers))) {
			page.total3PmSpofProtected += 1;
			parse3PmHeaders(http_transaction, page);
		}
		else if (/X-Akam-SW-Blocked/i.test(JSON.stringify(http_transaction.response.headers))) {
			page.total3PmSpofBlocked += 1;
			parse3PmHeaders(http_transaction, page);
		}
		else if(/x-akamai-ro-file-source.*transformer/i.test(JSON.stringify(http_transaction.response.headers)) || /Akamai Resource Optimizer/i.test(JSON.stringify(http_transaction.response.headers))) {
			page.totalRoOfflineTransforms += 1;
			parseRoOfflineHeaders(http_transaction, page, display_mode);

		}
		else {
			for (var i=0; i<http_transaction.response.headers.length; i++) {
				if (/content-type/i.test(http_transaction.response.headers[i].name)) {
					if (/image/i.test(http_transaction.response.headers[i].value)) {
						if (http_transaction.response.status == 304) {
							page.localCacheEnabled = true;
						}
						else {
							page.totalNonImImages += 1;
							parseNonImOrIcImageHeaders(http_transaction, page);
						}
					}
					else if (/css/i.test(http_transaction.response.headers[i].value)) {
						page.totalNonRoResources += 1;
						parseNonRoHeaders(http_transaction, page);
					}
					else if (/javascript/i.test(http_transaction.response.headers[i].value)) {
						page.totalNonRoResources += 1;
						parseNonRoHeaders(http_transaction, page);
					}
				}
			}
		}
	};

})(this);
