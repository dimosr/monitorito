QUnit.module( "monitor.MonitoringService", {
	beforeEach: function() {
		var eventSource = new EventSource();
		this.monitoringService = new MonitoringService(eventSource);

		this.controller = new CentralController(sinon.createStubInstance(InterfaceHandler), this.monitoringService, sinon.createStubInstance(GraphHandler));
		this.monitoringService.setController(this.controller);
		this.mockController = sinon.mock(this.controller);
	}
});

QUnit.test("enable(), disable(), isEnabled() methods", function(assert){
	var monitoringService = this.monitoringService;

	assert.ok(monitoringService.isEnabled(), "initialised monitoringService enabled by default");

	monitoringService.disable();
	assert.notOk(monitoringService.isEnabled(), "disable() working");

	monitoringService.enable();
	assert.ok(monitoringService.isEnabled(), "enable() working");
});


QUnit.test("addExcludedUrlPattern(), toBeExcluded() methods", function(assert){
	var monitoringService = this.monitoringService;

	assert.ok(!monitoringService.toBeExcluded("http://www.example.com/sub/test"), "no url is excluded by default");

	monitoringService.addExcludedUrlPattern("example.com");
	assert.ok(monitoringService.toBeExcluded("http://www.example.com/sub/test"), "extensions of added url patterns are excluded");
	assert.ok(!monitoringService.toBeExcluded("http://www.example.co.uk/sub/test"), "not-extensions of added url patterns are not excluded");
});

QUnit.test("onRequest(): incoming request with monitoring service disabled", function(assert){
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	mockController.expects("addRequestToGraph").never();

	var incomingRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var tabId = 1;

	monitoringService.disable();
	monitoringService.onRequest(incomingRequest, tabId);
	mockController.verify();
});

QUnit.test("onRequest(): incoming embedded request from not monitored session", function(assert){
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	mockController.expects("addRequestToGraph").never();

	var incomingRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.EMBEDDED);
	var tabId = 1;

	monitoringService.onRequest(incomingRequest, tabId);
	mockController.verify();
});

QUnit.test("onRequest(): incoming embedded request from monitored session", function(assert){
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	mockController.expects("addRequestToGraph").exactly(2);
	mockController.expects("addRedirectToGraph").never();

	var incomingRequest1 = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var tabId = 1;
	monitoringService.onRequest(incomingRequest1, tabId);

	var incomingRequest2 = new HttpRequest("GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);
	monitoringService.onRequest(incomingRequest2, tabId);

	mockController.verify();

	var monitoredSession = monitoringService.getSessionsArchive()[0];
	assert.ok(monitoredSession.getRootRequest() == incomingRequest1, "First request was archived");
	assert.ok(monitoredSession.getEmbeddedRequests().indexOf(incomingRequest2) != -1, "Second request was archived");
});

QUnit.test("onRedirect(): incoming redirect with monitoring service disabled", function(assert) {
	var monitoringService = this.monitoringService;

	monitoringService.disable();

	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.ROOT, Date.now());
	monitoringService.onRedirect(redirect);

	assert.ok(monitoringService.getRedirectsArchive().length == 0, "No redirect has been monitored");
});

QUnit.test("onRedirect(): incoming redirect from not monitored session", function(assert) {
	var monitoringService = this.monitoringService;

	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.EMBEDDED, Date.now());
	monitoringService.onRedirect(redirect);

	assert.ok(monitoringService.getRedirectsArchive().length == 0, "No redirect has been monitored");
});

QUnit.test("onRedirect(): incoming redirect from monitored session", function(assert) {
	var monitoringService = this.monitoringService;

	var request = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.EMBEDDED, Date.now());
	monitoringService.onRequest(request);
	monitoringService.onRedirect(redirect);

	assert.notOk(monitoringService.getRedirectsArchive().length == 0, "Redirects are being monitored");
	assert.ok(monitoringService.getRedirectsArchive().indexOf(redirect) != -1, "Monitored redirect is being archived")
});

QUnit.test("onRedirect(): incoming Root redirect", function(assert) {
	var monitoringService = this.monitoringService;

	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.ROOT, Date.now());
	monitoringService.onRedirect(redirect);

	assert.notOk(monitoringService.getRedirectsArchive().length == 0, "Redirects are being monitored");
	assert.ok(monitoringService.getRedirectsArchive().indexOf(redirect) != -1, "Monitored redirect is being archived")
});

QUnit.test("onRedirect(): monitored redirect not added to graph without the final request", function(assert) {
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	mockController.expects("addRedirectToGraph").never();

	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.ROOT, Date.now());
	monitoringService.onRedirect(redirect);

	mockController.verify();
});

QUnit.test("onRedirect(): monitored redirect added to graph after final request is being received", function(assert) {
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.ROOT, Date.now());
	var request = new HttpRequest("GET", "http://www.example2.com/test", Date.now(), {}, HttpRequest.Type.ROOT);

	mockController.expects("addRedirectToGraph").exactly(1).withArgs(redirect);
	
	monitoringService.onRedirect(redirect);
	monitoringService.onRequest(request);

	mockController.verify();
});