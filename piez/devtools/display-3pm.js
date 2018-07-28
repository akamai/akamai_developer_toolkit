function update3PMDetailsTable(page) {
	var threePmDetailsTable	= '<table class="detailed-results"><tr><th>URL</th><th>Script Management Action</th></tr>';
	page.threePmDownloadDetails.forEach(function(detail) {
		threePmDetailsTable += '<tr class="urlInfo">';
		threePmDetailsTable += '<td class="urlData"' + 'data-url="' + detail.url + '">' + '<a href="' + detail.url + '"' + ' target="_blank"' + '>' + detail.url + '</a>' + '</td>';
		threePmDetailsTable += '<td>' + detail.threePmAction + '</td>';
		threePmDetailsTable += '</tr>';
		document.getElementById('detailsBox1').style.display = 'block';
	});
	threePmDetailsTable += '</table>';
	document.getElementById('detailsBox1Table').innerHTML = threePmDetailsTable;
}