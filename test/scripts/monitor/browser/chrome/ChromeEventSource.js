QUnit.module( "monitor.browser.chrome.ChromeEventSource", {
	beforeEach: function() {
		this.browserAPI = {
			webRequest: {
				onBeforeRequest: {addListener: function(callback, filter, opt_extraInfoSpec) {}},
				onBeforeRedirect: {addListener: function(callback, filter, opt_extraInfoSpec) {}}
				
			}
		};
		this.chromeEventSource = new ChromeEventSource(this.browserAPI);
	}
});

QUnit.test("buildHttpRequest()", function(assert) {
	var chromeEventSource = this.chromeEventSource;

	var now = Date.now();
	var customRequest1 = {
		requestId: 1,
		url: "http://www.example.com/test",
		method: "GET",
		tabId: 5,
		timeStamp: now,
		type: "main_frame"
	};
	var customRequest2 = {
		requestId: 2,
		url: "http://www.example.com/submit",
		method: "POST",
		tabId: 5,
		timeStamp: now,
		type: "sub_frame",
		requestBody: {
			formData: {
				username: "bob"
			}
		}
	};

	var builtRequest1 = chromeEventSource.buildHttpRequest(customRequest1);
	var builtRequest2 = chromeEventSource.buildHttpRequest(customRequest2);

	
	assert.equal(builtRequest1.method, "GET", "HttpRequest method initialised correctly");
	assert.equal(builtRequest1.url, "http://www.example.com/test", "HttpRequest url initialised correctly");
	assert.equal(builtRequest1.timestamp, now, "HttpRequest url initialised correctly");
	assert.deepEqual(builtRequest1.bodyParams, {}, "HttpRequest type initialised correctly");
	assert.deepEqual(builtRequest2.bodyParams, {username: "bob"}, "HttpRequest type initialised correctly");
	assert.equal(builtRequest1.type, HttpRequest.Type.ROOT, "HttpRequest type initialised correctly");
	assert.equal(builtRequest2.type, HttpRequest.Type.EMBEDDED, "HttpRequest type initialised correctly");
});

QUnit.test("buildRedirect()", function(assert) {
	var chromeEventSource = this.chromeEventSource;

	var now = Date.now();
	var customRedirect1 = {
		requestId: 1,
		url: "http://www.example.com/test",
		method: "GET",
		tabId: 5,
		timeStamp: now,
		redirectUrl: "http://www.example2.com/test",
		type: "main_frame"
	};
	var customRedirect2 = {
		requestId: 2,
		url: "http://www.example.com/test.js",
		method: "GET",
		tabId: 5,
		timeStamp: now,
		redirectUrl: "http://www.example2.com/test.js",
		type: "script"
	};

	var builtRedirect1 = chromeEventSource.buildRedirect(customRedirect1);
	var builtRedirect2 = chromeEventSource.buildRedirect(customRedirect2);

	assert.equal(builtRedirect1.getInitialURL(), customRedirect1.url, "initial URL initialised correctly");
	assert.equal(builtRedirect1.getFinalURL(), customRedirect1.redirectUrl, "final URL initialised correctly");
	assert.equal(builtRedirect1.type, HttpRequest.Type.ROOT, "type initialised correctly");
	assert.equal(builtRedirect2.type, HttpRequest.Type.EMBEDDED, "type initialised correctly");
	assert.equal(builtRedirect1.timestamp, now, "timestamp initialised correctly");
});

QUnit.test("collectRequests() method", function(assert) {
	var browserAPI = this.browserAPI;
	var chromeEventSource = this.chromeEventSource;

	var mockWebRequestAPI = sinon.mock(browserAPI.webRequest.onBeforeRequest);

	mockWebRequestAPI.expects("addListener").exactly(1);

	chromeEventSource.collectRequests();

	mockWebRequestAPI.verify();
});


QUnit.test("collectRedirects() method", function(assert) {
	var browserAPI = this.browserAPI;
	var chromeEventSource = this.chromeEventSource;

	var mockWebRequestAPI = sinon.mock(browserAPI.webRequest.onBeforeRedirect);

	mockWebRequestAPI.expects("addListener").exactly(1);

	chromeEventSource.collectRedirects();

	mockWebRequestAPI.verify();
});