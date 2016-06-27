"use strict";

function Converter() {}

Converter.delimiter = "\"";
Converter.separator = ",";

Converter.quoteRegExp = new RegExp("\"", 'g');

Converter.getRedirectColumnValuesCSV = function() {
	return Converter.createCSVRow(["SessionID", "From", "To", "Type", "Timestamp"]);
}

Converter.getRequestsColumnValuesCSV = function() {
	return Converter.createCSVRow(["SessionID", "Method", "URL", "Timestamp", "Body Parameters", "Type", "Headers", "Referer"]);
}

Converter.getDomainsColumnValuesCSV = function() {
	return Converter.createCSVRow(["domain"]);
}

Converter.getCookiesColumnValuesCSV = function() {
	return Converter.createCSVRow(["domain", "key", "value", "type"]);
}

Converter.getResourcesColumnValuesCSV = function() {
	return Converter.createCSVRow(["domain", "url", "type", "method", "timestamp"]);
}

Converter.getEdgesColumnValuesCSV = function() {
	return Converter.createCSVRow(["fromResource", "toResource", "type"]);
}

Converter.redirectToCSV = function(sessionID, redirect) {
	return Converter.createCSVRow([sessionID, redirect._from, redirect._to, redirect.type, redirect.timestamp]);
}

Converter.requestToCSV = function(sessionID, request) {
	return Converter.createCSVRow([sessionID, request.method, request.url, request.timestamp, this.mapToCSVCell(request.bodyParams), request.type, this.mapToCSVCell(request.headers), request._referer]);
}

Converter.domainToCSV = function(node) {
	return Converter.createCSVRow([node.getID()]);
}

Converter.cookieToCSV = function(node, cookie) {
	return Converter.createCSVRow([node.getID(), cookie.key, cookie.value, cookie.type]);
}

Converter.resourceToCSV = function(node, request) {
	return Converter.createCSVRow([node.getID(), request.url, request.type, request.method, request.timestamp]);
}

Converter.edgeToCSV = function(edge) {
	return Converter.createCSVRow([edge.from, edge.to, edge.type]);
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
	return value.replace(Converter.quoteRegExp, "\"\"");
}