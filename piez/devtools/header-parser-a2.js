(function(global) {
	'use strict';

	//pushes an item to an array if it doesn't already exist
	Array.prototype.pushIfUnique = function(item, comparator) {
		var compareFunc = comparator || function(el) { return item === el; };
		var found = this.find(compareFunc, item); //use custom comparator if given
		if (found === undefined) {
			this.push(item);
		}
		return this.length; //same signature as Array.push
	};

	global.parsePageA2 = function(har, page) {
		var basePageUrl = har.pages[0].title; //current Chrome har implementation only keeps track of latest page navigated to
		page.pageLoadTime = Math.round(har.pages[0].pageTimings.onLoad);
		har.entries.forEach(function(entry) {
			if (entry.response.status === 304) {
				page.localCacheEnabled = true;
			}
			//get A2 info from base page
			if (entry.request.url === basePageUrl) {
				//base page redirected, get the new one from location header
				if (entry.response.status >= 300 && entry.response.status < 400) {
					var newLocation = entry.response.headers.find(function(header) {
						return /location/i.test(header.name);
					});
					if (newLocation !== undefined) {
						var parsedUrl = parseUrl(newLocation.value);
						//browser ignores the hash portion of the URL
						basePageUrl = parsedUrl.protocol + '//' + parsedUrl.host + parsedUrl.path + parsedUrl.query;
					}
				}
				else {
					parseBasePage(entry, page);
				}
			}
			//header from Akamai edge server verifies push
			else{
				var pushHeader = entry.response.headers.find(function(header) {
					return /^x-akamai-http2-push$/i.test(header.name);
				});
				if (pushHeader !== undefined) {
					page.resourcesPushed.edgePushed.pushIfUnique({url: entry.request.url, transferSize: entry.response._transferSize});
				}
			}
		});

		verifyA2Preconnects(page);
		verifyA2Pushed(page);
	};

	function parseBasePage(http_transaction, page) {
		http_transaction.response.headers.forEach(function(header) {

			page.baseUrl = http_transaction.request.url;
			if (/^x-akamai-a2-enabled$/i.test(header.name)) {
				page.A2Enabled = (header.value === 'true');
			}
			if (/^x-akamai-rua-debug-policy-version$/i.test(header.name)) {
				page.A2Policy = header.value;
			}

			//get all preconnects
			var preArr;
			if(/^x-akamai-rua-debug-common-preconnect-link-value$/i.test(header.name)) {
				preArr = header.value.match(/<([^>]+)>/g);
				if (preArr) {
					preArr.forEach(function(urlStr) {
						page.preconnects.common.pushIfUnique(urlStr.slice(1,-1)); //get rid of the <> surrounding url
					});
				}
			}
			if (/^x-akamai-rua-debug-unique-preconnect-link-value$/i.test(header.name)) {
				preArr = header.value.match(/<([^>]+)>/g);
				if (preArr) {
					preArr.forEach(function(urlStr) {
						page.preconnects.unique.pushIfUnique(urlStr.slice(1,-1));
					});
				}

			}
			if (/^link$/i.test(header.name)) {
				var linkList = header.value.split(',');
				linkList.forEach(function(resource) {
					resource = resource.split(';');
					if (/preconnect/i.test(resource[1])) {
						page.preconnects.linkHeader.pushIfUnique(resource[0].slice(1,-1));
					}
				}, linkList);
			}

			//get all pushed resources
			var pushArr;
			if (/^x-akamai-rua-debug-common-push-paths$/i.test(header.name)) {
				pushArr = header.value.split(' ');
				if (pushArr) {
					pushArr.forEach(function(res) {
						if (res !== '') {
							page.resourcesPushed.common.pushIfUnique({url: res}, function(el) { return this.url === el.url; });
						}
					});
				}
			}
			if (/^x-akamai-rua-debug-unique-push-paths$/i.test(header.name)) {
				pushArr = header.value.split(' ');
				if (pushArr) {
					pushArr.forEach(function(res) {
						if (res !== '') {
							page.resourcesPushed.unique.pushIfUnique({url: res}, function(el) { return this.url === el.url; });
						}
					});
				}
			}
		});
	}

	//make sure every resource the debug headers list is actually there
	global.verifyA2Preconnects = function(page) {

		page.preconnects.common.forEach(function(url) {
			if (page.preconnects.linkHeader.indexOf(url) === -1) {
				page.preconnects.notUsed.push(url);
			}
		});
		page.preconnects.unique.forEach(function(url) {
			if (page.preconnects.linkHeader.indexOf(url) === -1) {
				page.preconnects.notUsed.push(url);
			}
		});
	};

	//check against edge servers to make sure pushes are actually there
	global.verifyA2Pushed = function(page) {
		function matchUrl(el) {
			return el.url === this.valueOf();
		}
		var lastParsedUrl = null;
		page.resourcesPushed.common.forEach(function(element) {
			var parsedUrl = expandUrl(element.url, page.baseUrl, lastParsedUrl);
			var urlStr = parsedUrl.toString();
			lastParsedUrl = parsedUrl;
			var found = page.resourcesPushed.edgePushed.findIndex(matchUrl, urlStr);
			if (found === -1) {
				page.resourcesPushed.notUsed.pushIfUnique(element);
			}
			else {
				element.transferSize = page.resourcesPushed.edgePushed[found].transferSize;
			}
		});
		page.resourcesPushed.unique.forEach(function(element) {
			var parsedUrl = expandUrl(element.url, page.baseUrl, lastParsedUrl);
			var urlStr = parsedUrl.toString();
			lastParsedUrl = parsedUrl;
			var found = page.resourcesPushed.edgePushed.findIndex(matchUrl, urlStr);
			if (found === -1) {
				page.resourcesPushed.notUsed.pushIfUnique(element);
			}
			else {
				element.transferSize = page.resourcesPushed.edgePushed[found].transferSize;
			}
		});
	};

	function parseUrl(url) {
		var a =  document.createElement('a');
		a.href = url;
		var urlObj = {
			source: url,
			protocol: a.protocol,
			host: a.host,
			hostname: a.hostname,
			port: a.port,
			query: a.search,
			hash: a.hash,
			path: a.pathname,

			toString: function() {
				return this.protocol + '//' + this.host + this.path + this.query + this.hash;
			}
		};
		if (/^\/\//i.test(url)) { //protocol relative URL case, since we're in a chrome extension, that defaults to the protocol instead of https
			urlObj.protocol = 'https:';
		}
		return urlObj;
	}

	//expands out relative urls reported by A2 debug to compare to absolute urls given by Akamai edge servers
	global.expandUrl = function(url, baseUrl, lastParsedUrl) {
		var isAbsUrl = new RegExp('^(?:[a-z]+:)?//', 'i');
		if (isAbsUrl.test(url)) {
			return parseUrl(url); //fully expand out in case of protocol-relative urls
		}
		else { //deal with the various types of relative urls
			var parsedBase = lastParsedUrl == null ? parseUrl(baseUrl) : lastParsedUrl;
			var urlStr = parsedBase.protocol + '//' + parsedBase.host + parsedBase.path;
			if (url.slice(0,1) === '/') { //relative to base
				urlStr = parsedBase.protocol + '//' + parsedBase.host; //the relative url already begins with a slash
			}
			else if (urlStr.slice(-1) !== '/') {
				urlStr = urlStr + '/';
			}
			return parseUrl(urlStr + url); //parse our new base url with the relative
		}
	};

})(this);