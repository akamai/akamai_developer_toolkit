(function(global) {
	'use strict';

	global.parseNonRoHeaders = function(http_transaction, page) {
		var res = {};
		res.url = http_transaction.request.url;

		http_transaction.response.headers.forEach(function(header) {
			if (/^content-length$/i.test(header.name)) {
				res.contlen = header.value;
				if (res.contlen) {
					page.totalNonRoSize += parseInt(res.contlen);
				}
			}
			else if (/^content-type$/i.test(header.name)) {
				res.contype = (header.value).split(';')[0];
			}
		});
		page.nonRoDetails.push(res);
	};

	global.parseRoOfflineHeaders = function(http_transaction, page, display_mode) {
		var res = {};
		res.url = http_transaction.request.url;

		extractRoHeaders(http_transaction, page, res, 'offline');
		page.roOfflineDownloadDetails.push(res);
	};

	global.parseRoInProgressHeaders = function(http_transaction, page, display_mode) {
		var res = {};
		res.url = http_transaction.request.url;

		extractRoHeaders(http_transaction, page, res, 'in-progress');
		page.roInProgressDownloadDetails.push(res);
	};

	global.extractRoHeaders = function(http_transaction, page, res, resourceState) {
		http_transaction.response.headers.forEach(function(header) {
			if (/^X-Akamai-RO-Origin-Size$/i.test(header.name)) {
				res.orgsize = header.value;
				page.totalRoOriginalSize += parseInt(header.value);
			}
			else if (/^content-length$/i.test(header.name)) {
				res.contlen = header.value;

				if (resourceState == 'offline') {
					page.totalRoOfflineTransformSize += parseInt(header.value);
				}
			}
			else if (/^content-type$/i.test(header.name)) {
				res.contype = header.value;
			}
			else if (/^Content-Encoding$/i.test(header.name)) {
				if (header.value == 'br') {
					res.contenc = 'Brotli';
				}
				else if (header.value == 'zo') {
					res.contenc = 'Zopfli';
				}
				else {
					res.contenc = header.value;
				}
			}
			else if (/^X-Akamai-RO-File-Source$/i.test(header.name)) {
				res.filesource = header.value;
			}
			else if (/^X-Akamai-RO-Raw-Size$/i.test(header.name)) {
				res.rawsize = header.value;
			}
			else if (/^X-Akamai-RO-Request-Arrived$/i.test(header.name)) {
				res.requestarrived = header.value;
			}
			else if (/^X-Akamai-RO-Request-Sent-To-Cache$/i.test(header.name)) {
				res.requestsenttocache = header.value;
			}
			else if (/^X-Akamai-RO-Transformer-Hostname$/i.test(header.name)) {
				res.transformerhostname = header.value;
			}
		});
	};

})(this);