QUnit.module( "graph.integration.GraphStatsCalculatorWithAllOthers", {
    beforeEach: function() {
        this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
        this.graph = new Graph(this.visualisationNetwork);

        this.graphHandler = new GraphHandler(new GraphStatsCalculator());
        this.graphHandler.setGraph(this.graph);

        var request1 = new HttpRequest(1, "GET", "http://example.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        var request2 = new HttpRequest(2, "GET", "http://test.com/lib", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");
        request2.setHeaders({"Referer": "http://example.com"});
        var request3 = new HttpRequest(3, "GET", "http://foo.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        var redirect = new Redirect("http://foo.com", "http://bar.com", HttpRequest.Type.ROOT, Date.now());
        var request4 = new HttpRequest(4, "GET", "http://bar.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        var request5 = new HttpRequest(5, "GET", "http://test.com/lib", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");
        request5.setHeaders({"Referer": "http://bar.com"});

        this.graphHandler.addRequest(request1, request1);
        this.graphHandler.addRequest(request1, request2);
        this.graphHandler.addRequest(request3, request3);
        this.graphHandler.addRedirect(redirect);
        this.graphHandler.addRequest(request4, request4);
        this.graphHandler.addRequest(request4, request5);

    }
});

QUnit.test("Filtering applied before statistics calculation (no interference, statistics are maintained for the whole graph)", function(assert) {
    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(test\.com)|(example\.com)|(foo\.com)(.*)"));
    this.graphHandler.applyFilter(filterOptions);

    var graphStatistics = this.graphHandler.getGraphStatistics();
    assert.equal(graphStatistics.nodeTypes.firstParty, 3, "3 First Party domain nodes (example.com, bar.com, foo.com)");
    assert.equal(graphStatistics.nodeTypes.thirdParty, 1, "1 First Party domain node (test.com)");
    assert.equal(graphStatistics.totalEdges, 3, "3 edges in total: example.com --> test.com, bar.com --> test.com, bar.com --> foo.com");
    assert.equal(graphStatistics.inEdges.referral.max, 2, "2 referral incoming edges: (example.com --> test.com, bar.com --> test.com)");
    assert.equal(graphStatistics.inEdges.nonReferral.max, 1, "1 non-referral incoming edge: foo.com --> bar.com");

    var node = this.graphHandler.getGraph().getNode("test.com");
    assert.equal(node.getIncomingDomainEdges().length, 2, "Edge from filtered-out node bar.com will be taken into account in statistics");
    node = this.graphHandler.getGraph().getNode("foo.com");
    assert.equal(node.getOutgoingDomainEdges().length, 1, "Edge to filtered-out node bar.com will be taken into account in statistics");
});

QUnit.test("Clustering applied before statistics calculation (clustered nodes not taken into account & clusters taken into account)", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["example.com", "bar.com"]);
    this.graphHandler.cluster(clusterOptions, "cluster-1");

    /* Graph Statistics are calculated over the domain nodes, they are not affected by created clusters */
    var graphStatistics = this.graphHandler.getGraphStatistics();
    assert.equal(graphStatistics.nodeTypes.firstParty, 3, "3 First Party domain nodes (example.com, bar.com, foo.com)");
    assert.equal(graphStatistics.nodeTypes.thirdParty, 1, "1 First Party domain node (test.com)");
    assert.equal(graphStatistics.totalEdges, 3, "3 edges in total: example.com --> test.com, bar.com --> test.com, bar.com --> foo.com");
    assert.equal(graphStatistics.inEdges.referral.max, 2, "2 referral incoming edges: (example.com --> test.com, bar.com --> test.com)");
    assert.equal(graphStatistics.inEdges.nonReferral.max, 1, "1 non-referral incoming edge: foo.com --> bar.com");

    /* Node metrics are calculated based on current graph structure, so clusters are taken into account (and their contained nodes not) */
    var cluster = this.graphHandler.getGraph().getNode("cluster-1");
    assert.equal(cluster.getIncomingDomainEdges().length, 1, "edge foo.com --> cluster-1");
    assert.equal(cluster.getOutgoingDomainEdges().length, 1, "edge cluster-1 --> test.com");
    var node = this.graphHandler.getGraph().getNode("test.com");
    assert.equal(node.getIncomingDomainEdges().length, 1, "edge cluster-1 --> test.com");
    assert.equal(node.getOutgoingDomainEdges().length, 0, "not outgoing edges from test.com");
    node = this.graphHandler.getGraph().getNode("foo.com");
    assert.equal(node.getIncomingDomainEdges().length, 0, "no incoming edges to foo.com");
    assert.equal(node.getOutgoingDomainEdges().length, 1, "edge foo.com --> bar.com");
});


QUnit.test("Resources Expansion applied before statistics calculation (inter-domain edges hidden as visual optimisation, but taken into account in metrics)", function(assert) {
    this.graphHandler.expandDomainNode("test.com");

    var graph = this.graphHandler.getGraph();
    assert.ok(graph.existsEdge("bar.com", "http://test.com/lib"), "resource edge bar.com --> http://test.com/lib");
    assert.ok(!graph.getEdgeBetweenNodes("bar.com", "test.com").isVisible(), "inter-domain edge hidden");
    assert.ok(graph.existsEdge("example.com", "http://test.com/lib"), "resource edge example.com --> http://test.com/lib");
    assert.ok(!graph.getEdgeBetweenNodes("example.com", "test.com").isVisible(), "inter-domain edge hidden");
    assert.ok(graph.getNode("test.com").getIncomingDomainEdges().length == 2, "inter-domain edges hidden, but taken into account for metrics");
});