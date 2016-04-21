QUnit.module( "network.Session", {
	beforeEach: function() {
		this.rootRequest = new HttpRequest("POST", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
		this.session = new Session(this.rootRequest);
	}
});

QUnit.test("getRootRequest()", function(assert) {
	var session = this.session;
	var rootRequest = this.rootRequest;

	assert.equal(session.getRootRequest(), rootRequest, "getter works");
});

QUnit.test("addEmbeddedRequest(), getEmbeddedRequests() methods", function(assert) {
	var session = this.session;
	var request = new HttpRequest("POST", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	assert.equal(session.getEmbeddedRequests().length, 0, "embedded requests are initially empty");

	session.addEmbeddedRequest(request);
	assert.ok(session.getEmbeddedRequests().indexOf(request) != -1, "added embedded request is returned");
});