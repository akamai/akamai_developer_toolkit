(function(global) {
	'use strict';

	global.parseIcHeaders = function(http_transaction, page) {
			var res = {};
			res.url = http_transaction.request.url;

			http_transaction.response.headers.forEach(function(header) {
				if (/^x-image-server-original-size$/i.test(header.name)) {
					res.orgsize = header.value;
					page.totalImIcOriginalSize += parseInt(header.value);
				}
				else if (/^content-length$/i.test(header.name)) {
					res.contlen = header.value;
					page.totalIcTransformSize += parseInt(header.value);
				}
				else if (/^content-type$/i.test(header.name)) {
					res.contype = (header.value).split(';')[0];
				}
			});
			page.icDownloadDetails.push(res);
		};

	global.parseImHeaders = function(http_transaction, page, display_mode) {
		var res = {};
		res.url = http_transaction.request.url;

		extractImHeaders(http_transaction, page, res);
		page.imDownloadDetails.push(res);
	};

	global.extractImHeaders = function(http_transaction, page, res) {
		http_transaction.response.headers.forEach(function(header) {
			if (/^x-im-original-size$/i.test(header.name)) {
				res.orgsize = header.value;
				page.totalImIcOriginalSize += parseInt(header.value);
			}
			else if (/^content-length$/i.test(header.name)) {
				res.contlen = header.value;
				page.totalImTransformSize += parseInt(header.value);
			}
			else if (/^content-type$/i.test(header.name)) {
				res.contype = header.value;
			}
			else if (/^x-im-file-name$/i.test(header.name)) {
				res.filename = header.value;
			}
			else if (/^x-im-pixel-density$/i.test(header.name)) {
				res.pixelDensity = header.value;
			}
			else if (/^x-im-original-width$/i.test(header.name)) {
				res.originalWidth = header.value;
			}
			else if (/^x-im-encoding-quality$/i.test(header.name)) {
				if (parseInt(header.value) < 0 || parseInt(header.value) > 100) {
					res.encQuality = 'IMG-2834';
				}
				else {
					res.encQuality = header.value;
				}
			}

		});
	};

	global.parseNonImOrIcImageHeaders = function(http_transaction, page) {
		var res = {};
		res.url = http_transaction.request.url;

		http_transaction.response.headers.forEach(function(header) {
			if (/^content-length$/i.test(header.name)) {
				res.contlen = header.value;
				if (res.contlen) {
					page.totalNonImOrIcSize += parseInt(res.contlen);
				}
			}
			else if (/^content-type$/i.test(header.name)) {
				res.contype = (header.value).split(';')[0];
			}
		});
		page.nonImOrIcImageDetails.push(res);
	};
})(this);