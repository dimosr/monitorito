"use strict";

function Converter() {}

Converter.delimiter = "\"";
Converter.separator = ",";

Converter.escapedQuoteRegExp = new RegExp("\\\\\"", 'g'); //matches escaped quote -> \"
Converter.quoteRegExp = new RegExp("\"", 'g');  //matches single quote -> "

Converter.getRedirectColumnValuesCSV = function() {
	return Converter.createCSVRow(["SessionID", "From", "To", "Type", "Timestamp"]);
}

Converter.getRequestsColumnValuesCSV = function() {
	return Converter.createCSVRow(["SessionID", "RequestID", "Type", "Method", "URL", "Timestamp", "Body Parameters", "ResourceType", "Headers", "Referer"]);
}

Converter.getDomainsColumnValuesCSV = function() {
	return Converter.createCSVRow(["domain"]);
}

Converter.getCookiesColumnValuesCSV = function() {
	return Converter.createCSVRow(["Resource", "requestID", "key", "value", "type"]);
}

Converter.getRootRequestsColumnValuesCSV = function() {
	return Converter.createCSVRow(["resourceDomain", "resourceUrl", "requestID", "timestamp", "method", "type"]);
}

Converter.getEdgesColumnValuesCSV = function() {
	return Converter.createCSVRow(["fromResourceDomain", "fromResource", "toResourceDomain", "toResource", "edgeType", "requestID", "timestamp", "method", "type"]);
}

Converter.redirectToCSV = function(sessionID, redirect) {
	return Converter.createCSVRow([sessionID, redirect._from, redirect._to, redirect.type, redirect.timestamp]);
}

Converter.requestToCSV = function(sessionID, request) {
	return Converter.createCSVRow([sessionID, request.ID, request.type, request.method, request.url, request.timestamp, this.mapToCSVCell(request.bodyParams), request.resourceType, this.mapToCSVCell(request.headers), request._referer]);
}

Converter.domainToCSV = function(node) {
	return Converter.createCSVRow([node.getID()]);
}

Converter.cookieToCSV = function(request, cookie) {
	return Converter.createCSVRow([request.url, request.ID, cookie.key, cookie.value, cookie.type]);
}

Converter.rootRequestToCSV = function(request) {
	return Converter.createCSVRow([Util.getUrlHostname(request.url), request.url, request.ID, request.timestamp, request.method, request.resourceType ]);
}

Converter.edgeToCSV = function(edge) {
	if(edge.type == "REQUEST" || edge.type == "REFERRAL") return Converter.createCSVRow([Util.getUrlHostname(edge.from), edge.from, Util.getUrlHostname(edge.request.url), edge.request.url, edge.type, edge.request.ID, edge.request.timestamp, edge.request.method, edge.request.resourceType]);
	else if(edge.type == "REDIRECT") return Converter.createCSVRow([Util.getUrlHostname(edge.redirect.getInitialURL()), edge.redirect.getInitialURL(), Util.getUrlHostname(edge.redirect.getFinalURL()), edge.redirect.getFinalURL(), edge.type]);

}

Converter.mapToCSVCell = function(map) {
	var cell = "";
	var keys = Object.keys(map);
	for (var i = 0; i < keys.length; i++) {
		var paramVal = map[keys[i]];
		cell += "'" + keys[i] + "' : '" + paramVal + "'";
		if(i != (keys.length-1)) cell += "\n";
	}
	return cell;
}

Converter.createCSVRow = function(columnValues) {
	var row = "";
	for(var i = 0; i < columnValues.length; i++) {
		row += Converter.delimiter + Converter.csvEscape(columnValues[i]) + Converter.delimiter;
		if(i != (columnValues.length-1)) row += Converter.separator;
		else row += "\n";
	}
	return row;
}

Converter.csvEscape = function(value) {
	if(typeof(value) != "string") return value;

	value = value.replace(Converter.escapedQuoteRegExp, "\""); //"unescape" incorrectly-escaped quotes
	return value.replace(Converter.quoteRegExp, "\"\"");  //now correctly escape quotes
}