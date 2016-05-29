QUnit.module( "persistence.browser.chrome.ChromeStorageService", {
	beforeEach: function() {
		var storageEndpoint = {
			clear: function(){}, 
			get: function(id, callback){
				var session 
			}, 
			set: function(id, callback){}
		};
		this.mockStorageEndpoint = sinon.mock(storageEndpoint);

		var downloader = new Downloader();
		this.mockDownloader = sinon.mock(downloader);

		this.storageService = new ChromeStorageService(storageEndpoint, downloader);
	}
});

QUnit.test("clearStorage() method", function(assert) {
	var storageService = this.storageService;
	var mockStorageEndpoint = this.mockStorageEndpoint;

	mockStorageEndpoint.expects("clear").once();

	storageService.clearStorage();

	mockStorageEndpoint.verify();
});

QUnit.test("storeSession() method, calling persistence storage successfully", function(assert) {
	var storageService = this.storageService;
	var mockStorageEndpoint = this.mockStorageEndpoint;

	var session = sinon.createStubInstance(Session);

	mockStorageEndpoint.expects("set").once();

	storageService.storeSession(session);
	mockStorageEndpoint.verify();
});

QUnit.test("storeRedirect() method, calling persistence storage successfully", function(assert) {
	var storageService = this.storageService;
	var mockStorageEndpoint = this.mockStorageEndpoint;

	var redirect = sinon.createStubInstance(Redirect);

	mockStorageEndpoint.expects("set").once();

	storageService.storeRedirect(redirect);
	mockStorageEndpoint.verify();
});

QUnit.test("extractData() called without stored data does nothing", function(assert) {
	var storageService = this.storageService;
	var mockStorageEndpoint = this.mockStorageEndpoint;

	mockStorageEndpoint.expects("get").never();

	storageService.extractData();
	mockStorageEndpoint.verify();
});

QUnit.test("extractData() with stored data calles Downloader with correct formatted CSV", function(assert) {
	var storageService = this.storageService;
	var mockStorageEndpoint = this.mockStorageEndpoint;
	var mockDownloader = this.mockDownloader;

	mockStorageEndpoint.expects("get").atLeast(1);

	var request = new HttpRequest("GET", "http://www.example.com", 0, {}, HttpRequest.Type.ROOT);
	var session = new Session(request);
	var redirect = new Redirect("http://www.example.com", "https://www.example.com", HttpRequest.Type.ROOT, 0);
	storageService.storeSession(session);
	storageService.storeRedirect(redirect);

	storageService.extractData();

	mockStorageEndpoint.verify();
});