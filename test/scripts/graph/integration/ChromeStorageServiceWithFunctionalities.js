QUnit.module( "graph.integration.ChromeStorageServiceWithFunctionalities", {
    beforeEach: function() {
        this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
        this.graph = new Graph(this.visualisationNetwork);

        this.graphHandler = new GraphHandler(new GraphStatsCalculator());
        this.graphHandler.setGraph(this.graph);

        this.request1 = new HttpRequest(1, "GET", "http://example.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        this.request2 = new HttpRequest(2, "GET", "http://test.com/lib", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");
        this.request2.setHeaders({"Referer": "http://example.com"});
        this.request3 = new HttpRequest(3, "GET", "http://foo.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        this.redirect = new Redirect("http://foo.com", "http://bar.com", HttpRequest.Type.ROOT, Date.now());
        this.request4 = new HttpRequest(4, "GET", "http://bar.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        this.request5 = new HttpRequest(5, "GET", "http://test.com/lib", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");
        this.request5.setHeaders({"Referer": "http://bar.com"});

        this.graphHandler.addRequest(this.request1, this.request1);
        this.graphHandler.addRequest(this.request1, this.request2);
        this.graphHandler.addRequest(this.request3, this.request3);
        this.graphHandler.addRedirect(this.redirect);
        this.graphHandler.addRequest(this.request4, this.request4);
        this.graphHandler.addRequest(this.request4, this.request5);
    }
});

/*
    ChromeStorageService uses graph.getDomainEdges() to extract all edges. So, this method must return all existing edges in the graph (including hidden inter-domain edge
    (including hidden inter-domain edges due to expanded resources & detached edges due to clustering)
*/

QUnit.test("Hidden inter-domain edges are returned for extracting graph", function(assert) {
    this.graphHandler.expandDomainNode("example.com");
    this.graphHandler.expandDomainNode("test.com");

    var edge = this.graphHandler.getGraph().getEdgeBetweenNodes("example.com", "test.com");
    assert.ok(!edge.isVisible(), "inter-domain edge hidden");

    assert.ok(this.graphHandler.getGraph().getDomainEdges().indexOf(edge) >= 0, "inter-domain edge returned");
});

QUnit.test("Detached edges are returned for extracting graph", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["test.com", "example.com"]);
    this.graphHandler.cluster(clusterOptions, "cluster-1");

    var edge1 = this.graphHandler.getGraph().getEdgeBetweenNodes("example.com", "test.com");
    var edge2 = this.graphHandler.getGraph().getEdgeBetweenNodes("bar.com", "test.com");
    assert.ok(edge1.isDetached(), "edge between clustered nodes is detached");
    assert.ok(edge2.isDetached(), "edge between clustered node and normal node is detached");

    assert.ok(this.graphHandler.getGraph().getDomainEdges().indexOf(edge1) >= 0, "detached edge 1 included in the returned edges");
    assert.ok(this.graphHandler.getGraph().getDomainEdges().indexOf(edge2) >= 0, "detached edge 2 included in the returned edges");
});

/*
    ChromeStorageService uses graph.getDomainNodes() to extract nodes. So, this method should return all domain nodes
    including those that are currently clustered
 */

QUnit.test("", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["test.com", "example.com"]);
    this.graphHandler.cluster(clusterOptions, "cluster-1");

    var testNode = this.graphHandler.getGraph().getNode("test.com");
    var exampleNode = this.graphHandler.getGraph().getNode("example.com");
    var cluster = this.graphHandler.getGraph().getNode("cluster-1");

    assert.ok(this.graphHandler.getGraph().getDomainNodes().indexOf(testNode) >= 0, "test.com returned, even though clustered");
    assert.ok(this.graphHandler.getGraph().getDomainNodes().indexOf(exampleNode) >= 0, "example.com returned, even though clustered");
    assert.ok(this.graphHandler.getGraph().getDomainNodes().indexOf(cluster) < 0, "clusters are not returned, only domain nodes");
});