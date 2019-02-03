function updateImDetailsTable(page, display_mode) {
	switch (display_mode) {
		case "piez-im-simple":
			updateImSimpleTable(page);
			updateVideoDetailsTable(page);
			break;
		case "piez-im-advanced":
			updateImAdvandedTable(page);
			updateVideoAdvandedTable(page);
			break;
		default:
			updateImSimpleTable(page);
			updateVideoDetailsTable(page);
			break;
	}
}
//Image
function updateImSimpleTable(page) {
	var imDetailsTable = '<table id="imageSimple" class="detailed-results"><tr><th>Image URL</th><th>Transformed Type</th><th>Original Size</th><th>Transformed Size</th><th>% Bytes Change</th></tr>';
	page.imDownloadDetails.forEach(function (detail) {
		if (/image/i.test(detail.contype)) {
			imDetailsTable += '<tr id="row123"  class="urlInfo">';
			imDetailsTable += '<td class="urlData imageCompareUrl" data-width="' + detail.originalWidth + '" ' + 'data-url="' + detail.url + '">' + '<a href="' + "#" + '">' + detail.url + '</a>' + '</td>';
			imDetailsTable += '<td>' + detail.contype.substring(6) + '</td>';
			imDetailsTable += '<td>' + displayBytes(detail.orgsize) + '</td>';
			imDetailsTable += fileSizeDiff(detail.orgsize, detail.contlen);
			imDetailsTable += '<td>' + displayPercentChange(detail.orgsize, detail.contlen) + '</td>';
			imDetailsTable += '</tr>';
			document.getElementById('detailsBox1').style.display = 'block';
			page.totalImageMb = (((detail.orgsize / detail.contlen) - 1)).toFixed(2);
		}
	});
	imDetailsTable += '</table>';
	document.getElementById('detailsBox1Table').innerHTML = imDetailsTable;
	var rows = document.getElementById('imageSimple').getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;

	if (rows < 2) {
		document.getElementById('detailsBox1Table').style.visibility = "collapse";
	} else {
		document.getElementById('detailsBox1Table').style.visibility = "visible";
	}

}
//Video
function updateVideoDetailsTable(page) {
	var imDetailsTable = '<table id="VideoSimple" class="detailed-results"><tr><th>Video URL</th><th>Transformed Type</th><th>Original Size</th><th>Transformed Size</th><th>% Bytes Change</th></tr>';
	page.imDownloadDetails.forEach(function (detail) {
		if (/video/i.test(detail.contype)) {
			imDetailsTable += '<tr class="urlInfo">';
			imDetailsTable += '<td class="urlData videoCompareUrl" data-width="' + detail.originalWidth + '" ' + 'data-url="' + detail.url + '">' + '<a href="' + "#" + '">' + detail.url + '</a>' + '</td>';
			imDetailsTable += '<td>' + detail.contype.substring(6) + '</td>';
			imDetailsTable += '<td>' + displayBytes(detail.orgsize) + '</td>';
			imDetailsTable += fileSizeDiff(detail.orgsize, detail.contlen);
			imDetailsTable += '<td>' + displayPercentChange(detail.orgsize, detail.contlen) + '</td>';
			imDetailsTable += '</tr>';
			document.getElementById('detailsBox1').style.display = 'block';
		}
	});
	imDetailsTable += '</table>';
	document.getElementById('detailsBox1TaxbleVideo').innerHTML = imDetailsTable;


	var rows = document.getElementById('VideoSimple').getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;

	if (rows <= 1) {
		document.getElementById('detailsBox1TaxbleVideo').style.visibility = "collapse";
	} else {
		document.getElementById('detailsBox1TaxbleVideo').style.visibility = "visible";
	}
}

function updateImBrowserFormatCompareTable(page) {
	var imDetailsTable = '<table class="detailed-results"><tr><th>Image URL</th><th>Original Size</th><th>Generic</th><th>Chrome</th><th>Safari</th><th>IE</th>';
	page.imDownloadDetails.forEach(function (detail) {
		imDetailsTable += '<tr class="urlInfo">';
		imDetailsTable += '<td class="urlData" data-width="' + detail.originalWidth + '" ' + 'data-url="' + detail.url + '">' + '<a href="' + "#" + '">' + detail.url + '</a>' + '</td>';
		imDetailsTable += '<td>' + displayBytes(detail.orgsize) + '</td>';

		try {
			imDetailsTable += '<td>' + displayBytes(detail.browserFormats.generic.contlen) + '</td>';
		} catch (err) {
			imDetailsTable += '<td></td>';
		}

		try {
			imDetailsTable += '<td>' + displayBytes(detail.browserFormats.chrome.contlen) + '</td>';
		} catch (err) {
			imDetailsTable += '<td></td>';
		}

		try {
			imDetailsTable += '<td>' + displayBytes(detail.browserFormats.safari.contlen) + '</td>';
		} catch (err) {
			imDetailsTable += '<td></td>';
		}

		try {
			imDetailsTable += '<td>' + displayBytes(detail.browserFormats.ie.contlen);
		} catch (err) {
			imDetailsTable += '<td></td>';
		}

		imDetailsTable += '</tr>';
		document.getElementById('detailsBox1').style.display = 'block';
	});
	imDetailsTable += '</table>';
	document.getElementById('detailsBox1Table').innerHTML = imDetailsTable;
}
//Image
function updateImAdvandedTable(page) {
	var imDetailsTable = '<table id="imageAdvanced" class="detailed-results"><tr><th>Image URL</th><th>Transformed Type</th><th>Original Width</th><th>Encoding Quality</th><th>File Chosen</th><th>Original Size</th><th>Transformed Size</th><th>% Bytes Change</th></tr>';
	page.imDownloadDetails.forEach(function (detail) {
		if (/image/i.test(detail.contype)) {
			imDetailsTable += '<tr class="urlInfo">';
			imDetailsTable += '<td class="urlData imageCompareUrl" data-width="' + detail.originalWidth + '" ' + 'data-url="' + detail.url + '">' + '<a href="' + "#" + '">' + detail.url + '</a>' + '</td>';
			imDetailsTable += '<td>' + detail.contype.substring(6) + '</td>';
			imDetailsTable += '<td>' + detail.originalWidth + 'px</td>';
			//imDetailsTable += '<td>' + detail.pixelDensity + '</td>';
			imDetailsTable += '<td>' + getEncodingQuality(detail.contype, detail.encQuality) + '</td>';
			imDetailsTable += '<td>' + detail.filename + '</td>';
			imDetailsTable += '<td>' + displayBytes(detail.orgsize) + '</td>';
			imDetailsTable += fileSizeDiff(detail.orgsize, detail.contlen);
			imDetailsTable += '<td>' + displayPercentChange(detail.orgsize, detail.contlen) + '</td>';
			imDetailsTable += '</tr>';
			document.getElementById('detailsBox1').style.display = 'block';
		}
	});
	imDetailsTable += '</table>';
	document.getElementById('detailsBox1Table').innerHTML = imDetailsTable;

	var rows = document.getElementById("imageAdvanced").getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;
	if (rows < 2) {
		document.getElementById('detailsBox1Table').style.visibility = "collapse";
	} else {
		document.getElementById('detailsBox1Table').style.visibility = "visible";
	}

}
//Video
function updateVideoAdvandedTable(page) {
	var imDetailsTable = '<table id="videoAdvanced" class="detailed-results"><tr><th>Video URL</th><th>Transformed Type</th><th>Original Width</th><th>Encoding Quality</th><th>File Chosen</th><th>Original Size</th><th>Transformed Size</th><th>% Bytes Change</th></tr>';
	page.imDownloadDetails.forEach(function (detail) {
		page.totalVideoMb += (((parseFloat(detail.orgsize) / parseFloat(detail.contlen))));
		if (/video/i.test(detail.contype)) {
			imDetailsTable += '<tr class="urlInfo">';
			imDetailsTable += '<td class="urlData videoCompareUrl" data-width="' + detail.originalWidth + '" ' + 'data-url="' + detail.url + '">' + '<a href="' + "#" + '">' + detail.url + '</a>' + '</td>';
			imDetailsTable += '<td>' + detail.contype.substring(6) + '</td>';
			imDetailsTable += '<td>' + detail.originalWidth + 'px</td>';
			//imDetailsTable += '<td>' + detail.pixelDensity + '</td>';
			imDetailsTable += '<td>' + getEncodingQuality(detail.contype, detail.encQuality) + '</td>';
			imDetailsTable += '<td>' + detail.filename + '</td>';
			imDetailsTable += '<td>' + displayBytes(detail.orgsize) + '</td>';
			imDetailsTable += fileSizeDiff(detail.orgsize, detail.contlen);
			imDetailsTable += '<td>' + displayPercentChange(detail.orgsize, detail.contlen) + '</td>';
			imDetailsTable += '</tr>';
			document.getElementById('detailsBox1').style.display = 'block';
		}

	});
	imDetailsTable += '</table>';
	document.getElementById('detailsBox1TaxbleVideo').innerHTML = imDetailsTable;
	var rows = document.getElementById("videoAdvanced").getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;
	page.countImVideosTransformed = rows - 1;

	if (rows < 2) {
		document.getElementById('detailsBox1TaxbleVideo').style.visibility = "collapse";
	} else {
		document.getElementById('detailsBox1TaxbleVideo').style.visibility = "visible";
	}
}

function updateIcDetailsTable(page) {
	var icDetailsTable = '<table class="detailed-results"><tr><th>URL</th><th>Transformed Image Type</th><th>Original Size</th><th>Transformed Size</th><th>% Bytes Change</th></tr>';
	page.icDownloadDetails.forEach(function (detail) {
		icDetailsTable += '<tr class="urlInfo">';
		icDetailsTable += '<td class="urlData"' + 'data-url="' + detail.url + '">' + '<a href="' + detail.url + '"' + ' target="_blank"' + '>' + detail.url + '</a>' + '</td>';
		icDetailsTable += '<td>' + detail.contype + '</td>';
		icDetailsTable += '<td>' + displayBytes(detail.orgsize) + '</td>';
		icDetailsTable += fileSizeDiff(detail.orgsize, detail.contlen);
		icDetailsTable += '<td>' + displayPercentChange(detail.orgsize, detail.contlen) + '</td>';
		icDetailsTable += '</tr>';
		document.getElementById('detailsBox2').style.display = 'block';
	});
	icDetailsTable += '</table>';
	document.getElementById('detailsBox2Table').innerHTML = icDetailsTable;
}

function updateNonImIcDetailsTable(page) {
	var nonImIcDetailsTable = '<table class="detailed-results"><tr><th>URL</th><th>Image Type</th><th>Size</th>';
	page.nonImOrIcImageDetails.forEach(function (detail) {
		nonImIcDetailsTable += '<tr class="urlInfo">';
		nonImIcDetailsTable += '<td class="urlData"' + 'data-url="' + detail.url + '">' + '<a href="' + detail.url + '"' + ' target="_blank"' + '>' + detail.url + '</a>' + '</td>';
		nonImIcDetailsTable += '<td>' + detail.contype.substring(6) + '</td>';
		nonImIcDetailsTable += '<td>' + displayBytes(detail.contlen) + '</td>';
		nonImIcDetailsTable += '</tr>';
		document.getElementById('detailsBox3').style.display = 'block';
		document.getElementById('nonImIcBytes').textContent = displayBytes(page.totalNonImOrIcSize);
	});
	nonImIcDetailsTable += '</table>';
	document.getElementById('detailsBox3Table').innerHTML = nonImIcDetailsTable;
}
//Removed for now
function getEncodingQuality(contentType, encodingQuality) {
	if (contentType == 'image/gif' || contentType == 'image/png') {
		return "N/A";
	}
	else if (encodingQuality == 'IMG-2834') {
		return '-';
	}
	else {
		return encodingQuality;
	}
}

function bindCompareListener() {
	var imageUrls = document.querySelectorAll('.imageCompareUrl');
	var videoUrls = document.querySelectorAll('.videoCompareUrl');

	for (var i = 0, len = imageUrls.length; i < len; i++) {
		imageUrls[i].addEventListener('click', showImageCompare);
	}
	
	for (var i = 0, len = videoUrls.length; i < len; i++) {
		videoUrls[i].addEventListener('click', showVideoCompare);
	}	
	var buttonClose = document.getElementById('close');
	//Close image toggle
	buttonClose.onclick = function(){
		document.getElementById('imageBox').style.display="none";
	}
}

function hideImageCompare() {
	document.getElementById('imageBox').style.display = 'none';
	document.getElementById('imageCompare').style.display = 'none';
}

function hideVideoCompare() {
	document.getElementById('imageBox').style.display = 'none';
	document.getElementById('videoCompare').style.display = 'none';
}

function showImageCompare() {
	ga('send', 'event', 'displayImage', this.getAttribute('data-url'));

	hideVideoCompare();

	if (this.getAttribute('data-url').indexOf('?') == -1) {
		origImage = (this.getAttribute('data-url') + '?imbypass=true');
	} else {
		origImage = (this.getAttribute('data-url') + '&imbypass=true');
	}
	tranImage = this.getAttribute('data-url');

	i = new ImageToggle();
	i.addImages(origImage, tranImage);

	document.getElementById('originalImage').onclick = function () {
		window.open(i.originalImage.src);
	};
	document.getElementById('transformedImage').onclick = function () {
		window.open(i.transformedImage.src);
	};
	document.getElementById('compareTitle').innerHTML = "Image Comparison";
	document.getElementById('toggleBoxMessage').innerHTML = "Click the image to toggle";
	document.getElementById('compareUrlTitle').href = this.getAttribute('data-url');
	document.getElementById('compareUrlTitle').innerHTML = this.getAttribute('data-url');
	document.getElementById('imageBox').style.display = 'block';
	document.getElementById('imageCompare').style.display = 'block';
}

function showVideoCompare() {
	ga('send', 'event', 'displayImage', this.getAttribute('data-url'));

	hideImageCompare();

	if (this.getAttribute('data-url').indexOf('?') == -1) {
		origVideo = (this.getAttribute('data-url') + '?imbypass=true');
	} else {
		origVideo = (this.getAttribute('data-url') + '&imbypass=true');
	}
	tranVideo = this.getAttribute('data-url');

	var origVideoLink = document.getElementById('originalVideo');
	var tranVideoLink = document.getElementById('transformedVideo');
	v = new VideoToggle(origVideo, tranVideo, origVideoLink, tranVideoLink);

	origVideoLink.onclick = function () {
		window.open(origVideo);
	};
	tranVideoLink.onclick = function () {
		window.open(tranVideo);
	};

	tranVideoLink.className = 'unselectedImage';
	origVideoLink.className = 'selectedImage';

	document.getElementById('compareTitle').innerHTML = "Video Comparison"
	document.getElementById('toggleBoxMessage').innerHTML = "Click the video to toggle";
	document.getElementById('compareUrlTitle').href = tranVideo;
	document.getElementById('compareUrlTitle').innerHTML = tranVideo;
	document.getElementById('videoCompare').style.display = 'block';
	document.getElementById('imageBox').style.display = 'block';
}
