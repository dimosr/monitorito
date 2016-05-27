"use strict";

function Converter() {}

Converter.getRedirectColumnValuesCSV = function() {
	return Converter.createCSVRow(["From", "To", "Type", "Timestamp"]);
}

Converter.getRequestsColumnValuesCSV = function() {
	return Converter.createCSVRow(["SessionID", "Method", "URL", "Timestamp", "Body Parameters", "Type"]);
}

Converter.redirectToCSV = function(redirect) {
	return Converter.createCSVRow([redirect._from, redirect._to, redirect.type, redirect.timestamp]);
}

Converter.requestToCSV = function(sessionID, request) {
	return Converter.createCSVRow([sessionID, request.method, request.url, request.timestamp, this.mapToCSVCell(request.bodyParams), request.type]);
}

Converter.mapToCSVCell = function(map) {
	var cell = "";
	var keys = Object.keys(map);
	for (var i = 0; i < keys.length; i++) {
		var paramVal = map[keys[i]];
		cell += "\"" + keys[i] + "\" : \"" + paramVal + "\"";
		if(i != (keys.length-1)) cell += " | ";
	}
	return cell;
}

Converter.createCSVRow = function(columnValues) {
	var row = "";
	for(var i = 0; i < columnValues.length; i++) {
		row += "'" + columnValues[i] + "'";
		if(i != (columnValues.length-1)) row += ",";
		else row += "\n";
	}
	return row;
}