"use strict";

function Converter() {}

Converter.delimiter = "\"";
Converter.separator = ",";

Converter.getRedirectColumnValuesCSV = function() {
	return Converter.createCSVRow(["SessionID", "From", "To", "Type", "Timestamp"]);
}

Converter.getRequestsColumnValuesCSV = function() {
	return Converter.createCSVRow(["SessionID", "Method", "URL", "Timestamp", "Body Parameters", "Type", "Headers", "Referer"]);
}

Converter.getNodesColumnValuesCSV = function() {
	return Converter.createCSVRow(["domain"]);
}

Converter.getEdgesColumnValuesCSV = function() {
	return Converter.createCSVRow(["fromNode", "toNode"]);
}

Converter.redirectToCSV = function(sessionID, redirect) {
	return Converter.createCSVRow([sessionID, redirect._from, redirect._to, redirect.type, redirect.timestamp]);
}

Converter.requestToCSV = function(sessionID, request) {
	return Converter.createCSVRow([sessionID, request.method, request.url, request.timestamp, this.mapToCSVCell(request.bodyParams), request.type, this.mapToCSVCell(request.headers), request._referer]);
}

Converter.nodeToCSV = function(node) {
	return Converter.createCSVRow([node.getID()]);
}

Converter.edgeToCSV = function(edge) {
	return Converter.createCSVRow([edge.getSourceNode().getID(), edge.getDestinationNode().getID()]);
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
	return value.replace("\"", "\"\"");
}