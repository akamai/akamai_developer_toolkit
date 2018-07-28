function updateRoDetailsTable(page, display_mode) {
	switch (display_mode) {
		case "piez-ro-simple":
			updateRoSimpleTable(page);
			break;
		case "piez-ro-advanced":
			updateRoAdvandedTable(page);
			break
		default:
			updateRoSimpleTable(page);
			break;
	}
}

function updateRoSimpleTable(page) {
	var roDetailsTable	= '<table class="detailed-results"><tr><th>URL</th><th>Compression Type</th><th>Original Size</th><th>Transformed Size</th><th>% Bytes Change</th></tr>';
	page.roOfflineDownloadDetails.forEach(function(detail) {
		roDetailsTable += '<tr class="urlInfo">';
		roDetailsTable += '<td class="urlData">' + detail.url + '</td>';
		roDetailsTable += '<td>' + detail.contenc + '</td>';
		roDetailsTable += '<td>' + displayBytes(detail.orgsize) + '</td>';
		roDetailsTable += fileSizeDiff(detail.orgsize, detail.contlen);
		roDetailsTable += '<td>' + displayPercentChange(detail.orgsize, detail.contlen) + '</td>';
		roDetailsTable += '</tr>';
		document.getElementById('detailsBox1').style.display = 'block';
	});
	roDetailsTable += '</table>';
	document.getElementById('detailsBox1Table').innerHTML = roDetailsTable;
}

function updateNonRoDetailsTable(page) {
	var nonRoDetailsTable	= '<table class="detailed-results"><tr><th>URL</th><th>Content Type</th><th>Size</th>';
	page.nonRoDetails.forEach(function(detail) {
		nonRoDetailsTable += '<tr class="urlInfo">';
		nonRoDetailsTable += '<td class="urlData">' + detail.url + '</td>';
		nonRoDetailsTable += '<td>' + detail.contype + '</td>';
		nonRoDetailsTable += '<td>' + displayBytes(detail.contlen) + '</td>';
		nonRoDetailsTable += '</tr>';
		document.getElementById('detailsBox3').style.display = 'block';
		document.getElementById('nonImIcBytes').textContent = displayBytes(page.totalNonRoSize);
	});
	nonRoDetailsTable += '</table>';
	document.getElementById('detailsBox3Table').innerHTML = nonRoDetailsTable;
}

function updateRoInProgressDetailsTable(page) {
	var roInProgressDetailsTable = '<table class="detailed-results"><tr><th>URL</th><th>Compression Type</th><th>File Size</th>';
	page.roInProgressDownloadDetails.forEach(function(detail) {
		roInProgressDetailsTable += '<tr class="urlInfo">';
		roInProgressDetailsTable += '<td class="urlData">' + detail.url + '</td>';
		roInProgressDetailsTable += '<td>' + detail.contenc + '</td>';
		roInProgressDetailsTable += '<td>' + displayBytes(detail.contlen) + '</td>';
		roInProgressDetailsTable += '</tr>';
		document.getElementById('detailsBox2').style.display = 'block';
	});
	roInProgressDetailsTable += '</table>';
	document.getElementById('detailsBox2Table').innerHTML = roInProgressDetailsTable;
}

function updateRoAdvandedTable(page) {
	var roDetailsTable	= '<table class="detailed-results"><tr><th>URL</th><th>Compression Type</th><th>Original Size</th><th>Transformed Size</th><th>File Source</th><th>Raw Size</th><th>Secs b/w Req To Cache</th><th>Transformer Hostname</th><th>% Bytes Change</th></tr>';
	page.roOfflineDownloadDetails.forEach(function(detail) {
		roDetailsTable += '<tr class="urlInfo">';
		roDetailsTable += '<td class="urlData">' + detail.url + '</td>';
		roDetailsTable += '<td>' + detail.contenc + '</td>';
		roDetailsTable += '<td>' + displayBytes(detail.orgsize) + '</td>';
		roDetailsTable += fileSizeDiff(detail.orgsize, detail.contlen);
		roDetailsTable += '<td>' + detail.filesource + '</td>';
		roDetailsTable += '<td>' + detail.rawsize + '</td>';
		roDetailsTable += '<td>' + (Date.parse(detail.requestsenttocache) - Date.parse(detail.requestarrived)) / 1000 + '</td>';
		roDetailsTable += '<td>' + detail.transformerhostname + '</td>';
		roDetailsTable += '<td>' + displayPercentChange(detail.orgsize, detail.contlen) + '</td>';
		roDetailsTable += '</tr>';
		document.getElementById('detailsBox1').style.display = 'block';
	});
	roDetailsTable += '</table>';
	document.getElementById('detailsBox1Table').innerHTML = roDetailsTable;
}