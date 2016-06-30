QUnit.module( "persistence.conversion.Converter", {
	beforeEach: function() {
		this.graph = new Graph(null); //Graph without visualisation enabled
	}
});

QUnit.test("createCSVRow() method", function(assert) {
	var actualCSV = Converter.createCSVRow(["col1", "col2", "col3"]);
	var expectedCSV = '"col1","col2","col3"\n';

	assert.equal(actualCSV, expectedCSV, "createCSVRow translates input correctly.");
});

QUnit.test("getRedirectColumnValuesCSV() method", function(assert) {
	var actualColumns = Converter.getRedirectColumnValuesCSV();
	var expectedColumns = Converter.createCSVRow(["SessionID", "From", "To", "Type", "Timestamp"]);

	assert.equal(actualColumns, expectedColumns, "Redirect CSV Header columns are right.");
});

QUnit.test("getRedirectColumnValuesCSV() method", function(assert) {
	var actualColumns = Converter.getRedirectColumnValuesCSV();
	var expectedColumns = Converter.createCSVRow(["SessionID", "From", "To", "Type", "Timestamp"]);

	assert.equal(actualColumns, expectedColumns, "Redirect CSV Header columns are right.");
});

QUnit.test("getRequestsColumnValuesCSV() method", function(assert) {
	var actualColumns = Converter.getRequestsColumnValuesCSV();
	var expectedColumns = Converter.createCSVRow(["SessionID", "RequestID", "Type", "Method", "URL", "Timestamp", "Body Parameters", "ResourceType", "Headers", "Referer"]);

	assert.equal(actualColumns, expectedColumns, "Requests CSV Header columns are right.");
});

QUnit.test("getDomainsColumnValuesCSV() method", function(assert) {
	var actualColumns = Converter.getDomainsColumnValuesCSV();
	var expectedColumns = Converter.createCSVRow(["domain"]);

	assert.equal(actualColumns, expectedColumns, "Nodes CSV Header columns are right.");
});

QUnit.test("getRootRequestsColumnValuesCSV() method", function(assert) {
	var actualColumns = Converter.getRootRequestsColumnValuesCSV();
	var expectedColumns = Converter.createCSVRow(["resourceDomain", "resourceUrl", "requestID", "timestamp", "method", "type"]);

	assert.equal(actualColumns, expectedColumns, "Root Request CSV Header columns are right.");
});

QUnit.test("getCookiesColumnValuesCSV() method", function(assert) {
	var actualColumns = Converter.getCookiesColumnValuesCSV();
	var expectedColumns = Converter.createCSVRow(["Resource", "requestID", "key", "value", "type"]);

	assert.equal(actualColumns, expectedColumns, "Cookies CSV Header columns are right.");
});

QUnit.test("getEdgesColumnValuesCSV() method", function(assert) {
	var actualColumns = Converter.getEdgesColumnValuesCSV();
	var expectedColumns = Converter.createCSVRow(["fromResourceDomain", "fromResource", "toResourceDomain", "toResource", "edgeType", "requestID", "timestamp", "method", "type"]);

	assert.equal(actualColumns, expectedColumns, "Edges CSV Header columns are right.");
});

QUnit.test("redirectToCSV() method", function(assert) {
	var sessionID = 1;
	var redirect = new Redirect("http://www.example.com", "https://www.example.com", HttpRequest.Type.ROOT, 0);

	var actualCSV = Converter.redirectToCSV(sessionID, redirect);
	var expectedCSV = Converter.createCSVRow([sessionID, redirect.getInitialURL(), redirect.getFinalURL(), redirect.type, redirect.timestamp]);

	assert.equal(actualCSV, expectedCSV, "Redirect is converted correctly.");
});

QUnit.test("requestToCSV() method", function(assert) {
	var request = new HttpRequest(1, "GET", "http://www.example.com", 0, {}, HttpRequest.Type.ROOT, "main_frame");
	var sessionID = 1;

	var actualCSV = Converter.requestToCSV(sessionID, request);
	var expectedCSV = Converter.createCSVRow([sessionID, request.ID, request.type, request.method, request.url, request.timestamp, Converter.mapToCSVCell(request.bodyParams), request.resourceType, '', request.getReferer()]);

	assert.equal(actualCSV, expectedCSV, "Request is converted correctly.");
});

QUnit.test("domainToCSV() method", function(assert) {
	var node = new Node("example.com", this.graph);

	var actualCSV = Converter.domainToCSV(node);
	var expectedCSV = Converter.createCSVRow([node.getID()]);

	assert.equal(actualCSV, expectedCSV, "Request is converted correctly.");
});

QUnit.test("cookieToCSV() method", function(assert) {
	var request = new HttpRequest(1, "GET", "http://www.example.com/", 0, {}, HttpRequest.Type.ROOT, "main_frame");
	var node = new Node("example.com", this.graph);

	var actualCSV = Converter.cookieToCSV(request, {key: "SID", value: "d1dr", type: "FIRST_PARTY" });
	var expectedCSV = Converter.createCSVRow([request.url, request.ID, "SID", "d1dr", "FIRST_PARTY"]);

	assert.equal(actualCSV, expectedCSV, "Cookie is converted correctly.");
});

QUnit.test("rootRequestToCSV() method", function(assert) {
	var request = new HttpRequest(1, "GET", "http://www.example.com/", 0, {}, HttpRequest.Type.ROOT, "main_frame");

	var actualCSV = Converter.rootRequestToCSV(request);
	var expectedCSV = Converter.createCSVRow([Util.getUrlHostname(request.url), request.url, request.ID, request.timestamp, request.method, request.resourceType]);

	assert.equal(actualCSV, expectedCSV, "Root Request is converted correctly.");
});

QUnit.test("edgeToCSV() method", function(assert) {
	var redirect = new Redirect("http://www.example.com/", "http://www.sub.example.com/", HttpRequest.Type.ROOT, 0);
	var actualCSV = Converter.edgeToCSV({redirect: redirect, type: "REDIRECT"});
	var expectedCSV = Converter.createCSVRow(["www.example.com", "http://www.example.com/", "www.sub.example.com", "http://www.sub.example.com/", "REDIRECT"]);

	assert.equal(actualCSV, expectedCSV, "Edge is converted correctly.");
});

QUnit.test("mapToCSVCell() method", function(assert) {
	var actualCSV = Converter.mapToCSVCell({"key1": "val1", "key2": "val2"});
	var expectedCSV = "'key1' : 'val1'\n'key2' : 'val2'";

	assert.equal(actualCSV, expectedCSV, "Map is converted correctly.");
});