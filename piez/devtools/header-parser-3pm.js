(function(global) {
	'use strict';

	global.parse3PmHeaders = function(http_transaction, page) {
			var res = {};
			res.url = http_transaction.request.url;

			http_transaction.response.headers.forEach(function(header) {
				if (/^X-Akam-SW-Deferred$/i.test(header.name)) {
					page.total3PmResources += 1;
					res.threePmAction = "Deferred";
				}
				else if (/^X-Akam-SW-SPOF-Protected$/i.test(header.name)) {
					page.total3PmResources += 1;
					res.threePmAction = "SPOF Protected";
				}
				else if (/^X-Akam-SW-Blocked$/i.test(header.name)) {
					page.total3PmResources += 1;
					res.threePmAction = "Blocked";
				}
			});

			page.threePmDownloadDetails.push(res);
		};
})(this);
