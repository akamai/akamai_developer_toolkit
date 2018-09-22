
//three types of objects
//	array
//  object
//  function

var json2 = { "rules": { "name": "default", "children": [ { "name": "Performance", "children": [ { "name": "Compressible Objects", "children": [], "behaviors": [ { "name": "gzipResponse", "options": { "behavior": "ALWAYS" } } ], "criteria": [ { "name": "contentType", "options": { "matchCaseSensitive": false, "matchOperator": "IS_ONE_OF", "matchWildcard": true, "values": [ "text/*", "application/javascript", "application/x-javascript", "application/x-javascript*", "application/json", "application/x-json", "application/*+json", "application/*+xml", "application/text", "application/vnd.microsoft.icon", "application/vnd-ms-fontobject", "application/x-font-ttf", "application/x-font-opentype", "application/x-font-truetype", "application/xmlfont/eot", "application/xml", "font/opentype", "font/otf", "font/eot", "image/svg+xml", "image/vnd.microsoft.icon" ] } } ], "criteriaMustSatisfy": "all", "comments": "Compresses content to improve performance of clients with slow connections. Applies Last Mile Acceleration to requests when the returned object supports gzip compression." } ], "behaviors": [ { "name": "enhancedAkamaiProtocol", "options": { "display": "" } }, { "name": "allowTransferEncoding", "options": { "enabled": true } }, { "name": "removeVary", "options": { "enabled": true } } ], "criteria": [], "criteriaMustSatisfy": "all", "comments": "Improves the performance of delivering objects to end users. Behaviors in this rule are applied to all requests as appropriate." }, { "name": "Offload", "children": [ { "name": "CSS and JavaScript", "children": [], "behaviors": [ { "name": "caching", "options": { "behavior": "MAX_AGE", "mustRevalidate": false, "ttl": "1d" } }, { "name": "prefreshCache", "options": { "enabled": true, "prefreshval": 90 } } ], "criteria": [ { "name": "fileExtension", "options": { "matchCaseSensitive": false, "matchOperator": "IS_ONE_OF", "values": [ "css", "js" ] } } ], "criteriaMustSatisfy": "any", "comments": "Overrides the default caching behavior for CSS and JavaScript objects that are cached on the edge server. Because these object types are dynamic, the TTL is brief." }, { "name": "Static Objects", "children": [], "behaviors": [ { "name": "caching", "options": { "behavior": "MAX_AGE", "mustRevalidate": false, "ttl": "7d" } }, { "name": "prefreshCache", "options": { "enabled": true, "prefreshval": 90 } } ], "criteria": [ { "name": "fileExtension", "options": { "matchCaseSensitive": false, "matchOperator": "IS_ONE_OF", "values": [ "aif", "aiff", "au", "avi", "bin", "bmp", "cab", "carb", "cct", "cdf", "class", "doc", "dcr", "dtd", "exe", "flv", "gcf", "gff", "gif", "grv", "hdml", "hqx", "ico", "ini", "jpeg", "jpg", "mov", "mp3", "nc", "pct", "pdf", "png", "ppc", "pws", "swa", "swf", "txt", "vbs", "w32", "wav", "wbmp", "wml", "wmlc", "wmls", "wmlsc", "xsd", "zip", "pict", "tif", "tiff", "mid", "midi", "ttf", "eot", "woff", "woff2", "otf", "svg", "svgz", "webp", "jxr", "jar", "jp2" ] } } ], "criteriaMustSatisfy": "any", "comments": "Overrides the default caching behavior for images, music, and similar objects that are cached on the edge server. Because these object types are static, the TTL is long." }, { "name": "Uncacheable Responses", "children": [], "behaviors": [ { "name": "downstreamCache", "options": { "behavior": "TUNNEL_ORIGIN" } } ], "criteria": [ { "name": "cacheability", "options": { "matchOperator": "IS_NOT", "value": "CACHEABLE" } } ], "criteriaMustSatisfy": "all", "comments": "Overrides the default downstream caching behavior for uncacheable object types. Instructs the edge server to pass Cache-Control and/or Expire headers from the origin to the client." } ], "behaviors": [ { "name": "caching", "options": { "behavior": "NO_STORE" } }, { "name": "cacheError", "options": { "enabled": true, "preserveStale": true, "ttl": "10s" } }, { "name": "downstreamCache", "options": { "allowBehavior": "LESSER", "behavior": "ALLOW", "sendHeaders": "CACHE_CONTROL_AND_EXPIRES", "sendPrivate": false } } ], "criteria": [], "criteriaMustSatisfy": "all", "comments": "Controls caching, which offloads traffic away from the origin. Most objects types are not cached. However, the child rules override this behavior for certain subsets of requests." }, { "name": "Image Manager", "children": [], "behaviors": [ { "name": "caching", "options": { "behavior": "MAX_AGE", "mustRevalidate": false, "ttl": "30d" } } ], "criteria": [ { "name": "fileExtension", "options": { "matchCaseSensitive": false, "matchOperator": "IS_ONE_OF", "values": [ "jpg", "gif", "jpeg", "png", "imviewer" ] } } ], "criteriaMustSatisfy": "all", "comments": "Enable Scale for Mobile to serve the best available size for the requesting device. (Careful testing is highly recommended.) Enable Use Best File Type to serve the image format that works best for the requesting client. To configure breakpoint widths, derivative image quality, and artistic transformations, save and activate this configuration; then, create policies for this policy set via either Image Manager Policy Manager or the OPEN Image Manager API." } ], "behaviors": [ { "name": "origin", "options": { "cacheKeyHostname": "ORIGIN_HOSTNAME", "compress": true, "enableTrueClientIp": false, "forwardHostHeader": "ORIGIN_HOSTNAME", "httpPort": 80, "originType": "CUSTOMER", "hostname": "origin.akamaideveloper.net" } }, { "name": "cpCode", "options": { "value": { "id": 755127, "name": "DEV-POPS-RESERVED-123081", "description": "DevPoPs internal CPCODE" } } }, { "name": "allowPost", "options": { "allowWithoutContentLength": false, "enabled": true } }, { "name": "realUserMonitoring", "options": { "enabled": true } } ], "options": { "is_secure": false }, "variables": [], "comments": "The behaviors in the Default Rule apply to all requests for the property hostname(s) unless another rule overrides the Default Rule settings." } };

var transforms = {
	'object':{'tag':'div','class':'package ${show} ${type}','children':[
		{'tag':'div','class':'header','children':[
			{'tag':'div','class':function(obj){

				var classes = ["arrow"];

				if( getValue(obj.value) !== undefined ) classes.push("hide");
				
				return(classes.join(' '));
			}},
			{'tag':'span','class':'name','html':'${name}'},
			{'tag':'span','class':'value','html':function(obj) {
				var value = getValue(obj.value);
				if( value !== undefined ) return(" : " + value);
				else return('');
			}},
			{'tag':'span','class':'type','html':'${type}'}
		]},
		{'tag':'div','class':'children','children':function(obj){return(children(obj.value));}}
	]}
};

$(function(){
	
	$('#inputJSON').val(JSON.stringify(json2));

	//Visualize sample
	visualize(json2);

	$('#btnVisualize').click(function() {
		
		//Get the value from the input field
		var json_string = $('#inputJSON').val();
		
		//Parse the json string
		try
		{
			//json
			var json = JSON.parse(json_string);
		
			//eval
			//eval("var json=" + json_string);

			visualize(json);
		}
		catch (e)
		{
			alert("Sorry error in json string, please correct and try again: " + e.message);
		}
	});

});

function visualize(json) {
	
	$('#top').html('');

	$('#top').json2html(convert('json',json,'open'),transforms.object);

	regEvents();		
}

function getValue(obj) {
	var type = $.type(obj);

	//Determine if this object has children
	switch(type) {
		case 'array':
		case 'object':
			return(undefined);
		break;

		case 'function':
			//none
			return('function');
		break;

		case 'string':
			return("'" + obj + "'");
		break;

		default:
			return(obj);
		break;
	}
}

//Transform the children
function children(obj){
	var type = $.type(obj);

	//Determine if this object has children
	switch(type) {
		case 'array':
		case 'object':
			return(json2html.transform(obj,transforms.object));
		break;

		default:
			//This must be a litteral
		break;
	}
}

function convert(name,obj,show) {
	
	var type = $.type(obj);

	if(show === undefined) show = 'closed';
	
	var children = [];

	//Determine the type of this object
	switch(type) {
		case 'array':
			//Transform array
			//Itterrate through the array and add it to the elements array
			var len=obj.length;
			for(var j=0;j<len;++j){	
				//Concat the return elements from this objects tranformation
				children[j] = convert(j,obj[j]);
			}
		break;

		case 'object':
			//Transform Object
			var j = 0;
			for(var prop in obj) {
				children[j] = convert(prop,obj[prop]);
				j++;
			}	
		break;

		default:
			//This must be a litteral (or function)
			children = obj;
		break;
	}

	return( {'name':name,'value':children,'type':type,'show':show} );
	
}

function regEvents() {

	$('.header').click(function(){
		var parent = $(this).parent();

		if(parent.hasClass('closed')) {
			parent.removeClass('closed');
			parent.addClass('open');
		} else {
			parent.removeClass('open');
			parent.addClass('closed');
		}		
	});
}