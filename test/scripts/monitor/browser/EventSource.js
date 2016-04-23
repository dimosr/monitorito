QUnit.module( "monitor.browser.EventSource", {
	beforeEach: function() {
		this.eventSource = new EventSource();

		this.observer = {onRequest: function(request, isRoot, tabID) {}, onRedirect: function(redirect) {}};
		this.mockObserver = sinon.mock(this.observer);
	}
});

QUnit.test("unregistered observers do not receive notifications for events", function(assert) {
	var observer = this.observer;
	var mockObserver = this.mockObserver;
	var eventSource = this.eventSource;

	mockObserver.expects("onRequest").never();
	mockObserver.expects("onRedirect").never();

	var request = sinon.createStubInstance(HttpRequest);
	var tabID = 1;
	var redirect = sinon.createStubInstance(Redirect);

	eventSource.notifyForRequest(request, true, tabID);
	eventSource.notifyForRedirect(redirect);

	mockObserver.verify();
});

QUnit.test("registered observers receive notifications for events", function(assert) {
	var observer = this.observer;
	var mockObserver = this.mockObserver;
	var eventSource = this.eventSource;

	eventSource.register(observer);

	mockObserver.expects("onRequest").exactly(1);
	mockObserver.expects("onRedirect").exactly(1);

	var request = sinon.createStubInstance(HttpRequest);
	var tabID = 1;
	var redirect = sinon.createStubInstance(Redirect);

	eventSource.notifyForRequest(request, true, tabID);
	eventSource.notifyForRedirect(redirect);

	mockObserver.verify();
});