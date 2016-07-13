"use strict";

function Util(){}

Util.escapeHtml = function (text) {
    var escMap = { 
        '"': '&quot;',
        "'": '&#039;',
        '&': '&amp;', 
        '<': '&lt;', 
        '>': '&gt;' 
    };
    return text.replace(/[\"'&<>]/g, function (a) { return escMap[a]; });
};

Util.getUrlHostname = function(url) {
	var parsedURL = new URI(url);
	return parsedURL.hostname();
}

Util.getCookiesMap = function(cookiesString) {
	return cookiesString.split(";")
	.map(function(cookieString) {
		return cookieString.trim().split("=");
	})
	.reduce(function(acc, curr) {
		acc[curr[0]] = curr[1];
		return acc;
	}, {});
}

/*	Array prototype extension
	Help function for creating populated arrays
 */
Array.prototype.fill = function(val){
	for (var i = 0; i < this.length; i++){
		this[i] = val;
	}
	return this;
};