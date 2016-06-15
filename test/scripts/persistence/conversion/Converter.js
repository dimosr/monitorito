QUnit.module( "persistence.conversion.Converter" );

QUnit.test("createCSVRow() method", function(assert) {
	var actualCSV = Converter.createCSVRow(["col1", "col2", "col3"]);
	var expectedCSV = "'col1','col2','col3'\n";

	assert.equal(actualCSV, expectedCSV, "createCSVRow translates input correctly.");
});

QUnit.test("getRedirectColumnValuesCSV() method", function(assert) {
	var actualColumns = Converter.getRedirectColumnValuesCSV();
	var expectedColumns = Converter.createCSVRow(["SessionID", "From", "To", "Type", "Timestamp"]);

	assert.equal(actualColumns, expectedColumns, "Redirect CSV Header columns are right.");
});

QUnit.test("getRequestsColumnValuesCSV() method", function(assert) {
	var actualColumns = Converter.getRequestsColumnValuesCSV();
	var expectedColumns = Converter.createCSVRow(["SessionID", "Method", "URL", "Timestamp", "Body Parameters", "Type", "Headers", "Referer"]);

	assert.equal(actualColumns, expectedColumns, "Requests CSV Header columns are right.");
});

QUnit.test("redirectToCSV() method", function(assert) {
	var sessionID = 1;
	var redirect = new Redirect("http://www.example.com", "https://www.example.com", HttpRequest.Type.ROOT, 0);

	var actualCSV = Converter.redirectToCSV(sessionID, redirect);
	var expectedCSV = Converter.createCSVRow([sessionID, redirect.getInitialURL(), redirect.getFinalURL(), redirect.type, redirect.timestamp]);

	assert.equal(actualCSV, expectedCSV, "Redirect is converted correctly.");
});

QUnit.test("requestToCSV() method", function(assert) {
	var request = new HttpRequest("GET", "http://www.example.com", 0, {}, HttpRequest.Type.ROOT);
	var sessionID = 1;

	var actualCSV = Converter.requestToCSV(sessionID, request);
	var expectedCSV = Converter.createCSVRow([sessionID, request.method, request.url, request.timestamp, Converter.mapToCSVCell(request.bodyParams), request.type, '', request.getReferer()]);

	assert.equal(actualCSV, expectedCSV, "Request is converted correctly.");
});

QUnit.test("mapToCSVCell() method", function(assert) {
	var actualCSV = Converter.mapToCSVCell({"key1": "val1", "key2": "val2"});
	var expectedCSV = '"key1" : "val1" | "key2" : "val2"';

	assert.equal(actualCSV, expectedCSV, "Map is converted correctly.");
});