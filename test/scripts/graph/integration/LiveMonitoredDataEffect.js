QUnit.module( "graph.integration.LiveMonitoredDataEffect", {
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

QUnit.test("Clustering - Case 1: Incoming node has edge with clustered nodes", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["foo.com", "bar.com"]);
    this.graphHandler.cluster(clusterOptions, "cluster-1");

    var request = new HttpRequest(6, "GET", "http://sub.foo.com/resource", Date.now(), {}, HttpRequest.Type.EMBEDDED);
    this.graphHandler.addRequest(this.request3, request);

    var cluster = this.graphHandler.getGraph().getNode("cluster-1");
    var newNode = this.graphHandler.getGraph().getNode("sub.foo.com")
    assert.ok(cluster.getNodes().length == 2, "cluster-1 has initial 2 nodes");
    assert.ok(cluster.getNodes().indexOf(newNode) < 0, "new node belonging in the cluster, but not added (need to re-cluster)");
    assert.ok(this.graphHandler.getGraph().getEdgeBetweenNodes("foo.com", "sub.foo.com").isDetached(), "Edge foo.com --> sub.foo.com detached, since foo.com is clustered");
    assert.ok(cluster.hasEdgeTo(newNode), "corresponding clusterEdge created");
});

QUnit.test("Clustering - Case 2: Incoming node has no edge with clustered nodes", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["foo.com", "bar.com"]);
    this.graphHandler.cluster(clusterOptions, "cluster-1");

    var request = new HttpRequest(6, "GET", "http://sub.example.com/resource", Date.now(), {}, HttpRequest.Type.EMBEDDED);
    this.graphHandler.addRequest(this.request1, request);

    assert.ok(!this.graphHandler.getGraph().getEdgeBetweenNodes("example.com", "sub.example.com").isDetached(), "Edge example.com --> sub.example.com created and is not detached, since example.com was not clustered");
})

QUnit.test("Clustering - Case 3: Incoming new edge between 2 nodes that belong in different clusters", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["foo.com", "bar.com"]);
    this.graphHandler.cluster(clusterOptions, "cluster-1");

    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["example.com", "test.com"]);
    this.graphHandler.cluster(clusterOptions, "cluster-2");

    var request = new HttpRequest(7, "GET", "http://test.com/lib", Date.now(), {}, HttpRequest.Type.EMBEDDED);
    this.graphHandler.addRequest(this.request3, request);

    assert.ok(this.graphHandler.getGraph().getEdgeBetweenNodes("foo.com", "test.com").isDetached(), "Edge foo.com --> test.com created, but detached, since nodes belong to different clusters");
    assert.ok(this.graphHandler.getGraph().existsEdge("cluster-1", "cluster-2"), "Corresponding edge cluster-1 --> cluster-2 created");
})

QUnit.test("Clustering - Case 4: Incoming new edge between 2 nodes that belong in same cluster", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["foo.com", "bar.com", "test.com"]);
    this.graphHandler.cluster(clusterOptions, "cluster-1");

    var request = new HttpRequest(7, "GET", "http://test.com/lib", Date.now(), {}, HttpRequest.Type.EMBEDDED);
    this.graphHandler.addRequest(this.request3, request);

    assert.ok(this.graphHandler.getGraph().getEdgeBetweenNodes("foo.com", "test.com").isDetached(), "edge foo.com --> test.com created, but detached, since both nodes belong in the same cluster");
    assert.ok(!this.graphHandler.getGraph().existsEdge("cluster-1", "cluster-1"), "no self-referencing edge created for clusters");
})

QUnit.test("Filtering: Incoming data are never filtered out", function(assert) {
    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(example.com)(.*)"));
    this.graphHandler.applyFilter(filterOptions);

    var request = new HttpRequest(7, "GET", "http://sub.foo.com/resource", Date.now(), {}, HttpRequest.Type.EMBEDDED);
    this.graphHandler.addRequest(this.request3, request);
    var request = new HttpRequest(8, "GET", "http://sub.foo.com/resource", Date.now(), {}, HttpRequest.Type.EMBEDDED);
    this.graphHandler.addRequest(this.request1, request);

    assert.ok(!this.graphHandler.getGraph().getNode("foo.com").isVisible(), "foo.com was filtered");
    assert.ok(this.graphHandler.getGraph().getNode("sub.foo.com").isVisible(), "sub.foo.com not filtered out, since it was added after the filter was applied");
    assert.ok(!this.graphHandler.getGraph().getEdgeBetweenNodes("foo.com", "sub.foo.com").isVisible(), "Added edge between non-filtered and filtered node is filtered out");
    assert.ok(this.graphHandler.getGraph().getEdgeBetweenNodes("example.com", "sub.foo.com").isVisible(), "Added edge between non-filtered nodes is not filtered out");
});

QUnit.test("Expanding Resources - Case 1: Incoming request belonging to non-expanded node", function(assert) {
    var request = new HttpRequest(7, "GET", "http://foo.com/resource", Date.now(), {}, HttpRequest.Type.EMBEDDED);
    this.graphHandler.addRequest(this.request3, request);

    assert.ok(!this.graphHandler.getGraph().existsNode("http://foo.com/resource"), "node not expanded, thus added resource not expanded");
});

QUnit.test("Expanding Resources - Case 1: Incoming request belonging to expanded node", function(assert) {
    this.graphHandler.expandDomainNode("foo.com");

    var request = new HttpRequest(7, "GET", "http://foo.com/resource", Date.now(), {}, HttpRequest.Type.EMBEDDED);
    this.graphHandler.addRequest(this.request3, request);

    assert.ok(this.graphHandler.getGraph().existsNode("http://foo.com"), "resource added before expanding, expanded");
    assert.ok(!this.graphHandler.getGraph().existsNode("http://foo.com/resource"), "resource added after expanding, not expanded");
});