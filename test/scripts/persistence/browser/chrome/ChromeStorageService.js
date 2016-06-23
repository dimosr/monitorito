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
		this.storageService.setController(sinon.createStubInstance(CentralController));
	}
});

QUnit.test("clearStorage() method", function(assert) {
	var storageService = this.storageService;
	var mockStorageEndpoint = this.mockStorageEndpoint;

	mockStorageEndpoint.expects("clear").once();

	storageService.clearStorage();

	mockStorageEndpoint.verify();
});

QUnit.test("storeRequest() method, calling persistence storage successfully", function(assert) {
	var storageService = this.storageService;
	var mockStorageEndpoint = this.mockStorageEndpoint;

	var sessionID = 1;
	var request = sinon.createStubInstance(HttpRequest);

	mockStorageEndpoint.expects("set").once();

	storageService.storeRequest(sessionID, request);
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

QUnit.test("extractData() with stored data called Downloader with correct formatted CSV", function(assert) {
	var storageService = this.storageService;
	var mockStorageEndpoint = this.mockStorageEndpoint;

	mockStorageEndpoint.expects("get").atLeast(1);

	var sessionID = 1;
	var request = new HttpRequest("GET", "http://www.example.com", 0, {}, HttpRequest.Type.ROOT);
	var redirect = new Redirect("http://www.example.com", "https://www.example.com", HttpRequest.Type.ROOT, 0);
	storageService.storeRequest(sessionID, request);
	storageService.storeRedirect(redirect);

	storageService.extractData();

	mockStorageEndpoint.verify();
});

QUnit.test("extractGraph()", function(assert) {
	var storageService = this.storageService;
	var mockDownloader = this.mockDownloader;

	var graph = new Graph(null);
	graph.createNode("www.example.com");
	graph.createNode("www.example2.com");
	graph.createEdge("www.example.com", "www.example2.com");

	mockDownloader.expects("saveFileAs").exactly(2);  //1 call for the nodes and 1 for the edges

	storageService.extractGraph(graph);

	storageService.extractData();

	mockDownloader.verify();
});