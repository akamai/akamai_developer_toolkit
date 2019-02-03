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
		res.contlen = http_transaction.response.content;
		// Sum of video contentl
		
		var details =JSON.stringify(page.imDownloadDetails);
		if(details.indexOf(res.url) < 0){
			page.totalIMImagesTransformed += 1;
			extractImHeaders(http_transaction, page, res);
			page.imDownloadDetails.push(res);
		}	
	};

	global.extractImHeaders = function(http_transaction, page, res) {
		var headers = http_transaction.response.headers;
		// Separate finds to process headers that are depended on first
		res.contype 	  = headers.find(header => /^content-type$/i.test(header.name)).value;
		res.filename 	  = headers.find(header => /^x-im-file-name$/i.test(header.name)).value;
		res.pixelDensity  = headers.find(header => /^x-im-pixel-density$/i.test(header.name)).value;
		res.originalWidth = headers.find(header => /^x-im-original-width$/i.test(header.name)).value;
		var encQuality    = headers.find(header => /^x-im-encoding-quality$/i.test(header.name)).value;
		if (parseInt(encQuality) < 0 || parseInt(encQuality) > 100) {
			res.encQuality = 'IMG-2834';
		} else {
			res.encQuality = encQuality;
		}
		res.orgsize = headers.find(o => /^x-im-original-size$/i.test(o.name)).value;
		if(res.orgsize !== undefined) {
			page.totalImIcOriginalSize += parseInt(res.orgsize);
			if (/video/i.test(res.contlen.mimeType) || /video/i.test(res.contype)){
				page.totalVideoOriginalMb += parseFloat(res.orgsize);
				page.countImVideosTransformed++;
			}
			if (/image/i.test(res.contlen.mimeType) || /image/i.test(res.contype)){
				page.totalImageOriginalMb += parseFloat(res.orgsize);
				page.countImImagesTransformed++;
			}
		}
		res.contlen = headers.find(o => /^content-length$/i.test(o.name)).value;
		if(res.contlen !== undefined) {
			page.totalImTransformSize += parseInt(res.contlen);
			if (/video/i.test(res.contlen.mimeType) || /video/i.test(res.contype)){
				page.totalVideoTransformedMb += parseFloat(res.contlen);
			}
			if (/image/i.test(res.contlen.mimeType) || /image/i.test(res.contype)){
				page.totalImageTransformedMb += parseFloat(res.contlen);
			}
		}
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