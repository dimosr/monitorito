QUnit.module( "graph.integration.FilteringEngineWithClustering", {
    beforeEach: function() {
        this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
        this.graph = new Graph(this.visualisationNetwork);

        this.resourcesExplorerEngine = new ResourcesExplorerEngine(this.graph);

        this.clusteringEngine = new ClusteringEngine(this.graph, this.resourcesExplorerEngine);
        this.graph.setClusteringEngine(this.clusteringEngine);

        this.graphStatsCalculator = new GraphStatsCalculator();
        this.filteringEngine = new FilteringEngine(this.graph, this.graphStatsCalculator);
        this.filteringEngine.resetFilter();

        this.node1 = this.graph.createDomainNode("www.example.com");
        this.node2 = this.graph.createDomainNode("example.com");
        this.node3 = this.graph.createDomainNode("test.com");
        this.node4 = this.graph.createDomainNode("dummy.com");
        this.edge1 = this.graph.createDomainEdge("example.com", "www.example.com");
        this.edge2 = this.graph.createDomainEdge("example.com", "test.com");
        var request1 = new HttpRequest(1, "GET", "http://example.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        var redirect = new Redirect("http://example.com", "http://www.example.com", HttpRequest.Type.ROOT, Date.now());
        var request2 = new HttpRequest(2, "GET", "http://www.example.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        var request3 = new HttpRequest(3, "GET", "http://test.com", Date.now(), {}, HttpRequest.Type.EMBEDDED, "sub_frame");
        this.node1.addRequest(request1);
        this.node2.addRequest(request2);
        this.node3.addRequest(request3);
        this.edge1.addLink("http://example.com", redirect, DomainEdge.LinkType.REDIRECT);
        this.edge2.addLink("http://example.com", request3, DomainEdge.LinkType.REQUEST);
    }
});

QUnit.test("Filtering applied before Clustering", function(assert) {
    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("^((test\.com)|(example\.com)|(dummy\.com))$"));
    this.filteringEngine.filter(filterOptions);

    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com", "dummy.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    var node1 =this.graph.getNode("www.example.com");
    assert.ok(!node1.isClustered() && !node1.isVisible(), "www.example.com filtered out and thus not included in the clustered nodes");
    assert.ok(this.graph.existsEdge("example.com", "cluster-1"), "edge example.com --> cluster-1 created");
    assert.ok(this.graph.getNode("dummy.com").isClustered(), "dummy.com successfully clustered");
    assert.ok(this.graph.getNode("test.com").isClustered(), "test.com successfully clustered");
});

QUnit.test("Filtering applied after Clustering", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    var filterOptions = new FilterOptions();
    filterOptions.setEdgesMin("incoming", 1);
    this.filteringEngine.filter(filterOptions);

    assert.ok(!this.node1.isVisible() && this.node1.isClustered(), "www.example.com not affected by filtering, since clustered");
    assert.ok(!this.node3.isVisible() && this.node3.isClustered(), "test.com not affected by filtering, since clustered");
    assert.ok(!this.node4.isVisible(), "dummy.com hidden by filtering, since it has no incoming edges");
    assert.ok(!this.node2.isVisible(), "example.com filtered out, because has less than 1 incoming edges");
    assert.ok(this.clusteringEngine.getCluster("cluster-1").isVisible(), "cluster matched by filter, since it has at least 1 incoming edge");

    this.filteringEngine.resetFilter();
    assert.ok(!this.node1.isVisible() && this.node1.isClustered(), "www.example.com not affected by reset filtering, since clustered");
    assert.ok(!this.node3.isVisible() && this.node3.isClustered(), "test.com not affected by reset filtering, since clustered");
    assert.ok(!this.node1.getEdgeFrom(this.node2).isVisible(), "edge example.com --> www.example.com to clustered node not shown after resetting the filter");
    assert.ok(!this.node3.getEdgeFrom(this.node2).isVisible(), "edge example.com --> test.com to clustered node not shown after resetting the filter");
    assert.ok(this.node4.isVisible(), "dummy.com shown, since filter is reset");
    assert.ok(this.node2.isVisible(), "example.com shown, since filter is reset");
    assert.ok(this.clusteringEngine.getCluster("cluster-1").isVisible(), "cluster shown, since filter is reset");

    filterOptions = new FilterOptions();
    filterOptions.setEdgesMin("outgoing", 1);
    this.filteringEngine.filter(filterOptions);

    assert.ok(!this.node1.isVisible() && this.node1.isClustered(), "www.example.com not affected by filtering, since clustered");
    assert.ok(!this.node3.isVisible() && this.node3.isClustered(), "test.com not affected by filtering, since clustered");
    assert.ok(!this.node4.isVisible(), "dummy.com hidden by filter, since it has no outgoing edges");
    assert.ok(this.node2.isVisible(), "example.com shown, since has at least 1 outgoing edge");
    assert.ok(!this.clusteringEngine.getCluster("cluster-1").isVisible(), "cluster hidden by filter, since it does not have at least 1 outgoing edge");
});

QUnit.test("Filtering applied after clustering, with neihgbours depth 1, where there is one such expanded neighbour (incoming)", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    /* Filter only cluster node with direct neighbours, where there one such expanded neighbour (incoming)*/
    this.resourcesExplorerEngine.expand(this.node2);
    filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(cluster-1)(.*)"));
    filterOptions.setNeighboursDepth(1);
    this.filteringEngine.filter(filterOptions);

    assert.ok(this.clusteringEngine.getCluster("cluster-1").isVisible(), "cluster matched by filter");
    assert.ok(this.node2.isVisible(), "example.com not matched by filter, but shown as neighbour of cluster");
    assert.ok(!this.node4.isVisible(), "dummy.com not matched by filter");
    assert.ok(this.graph.getEdgeBetweenNodes("http://example.com", "cluster-1").isVisible(), "edge http://example.com --> cluster-1 shown by filter");
})

QUnit.test("Filtering applied after clustering, with neihgbours depth 1, where there is one such expanded neighbour (outgoing)", function(assert) {
    /* Filter only cluster node with direct neighbours, where there one such expanded neighbour (outgoing)*/
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.REGEXP);
    clusterOptions.setRegExp(new RegExp("^((example\.com)|(dummy\.com))$"));
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");
    filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(cluster-1)(.*)"));
    filterOptions.setNeighboursDepth(1);
    this.filteringEngine.filter(filterOptions);


    assert.ok(this.clusteringEngine.getCluster("cluster-1").isVisible(), "cluster matched by filter");
    assert.ok(this.node1.isVisible(), "www.example.com not matched by filter, but shown as neighbour of cluster");
    assert.ok(this.node3.isVisible(), "test.com not matched by filter, but shown as neighbour of cluster");
    assert.ok(this.graph.getEdgeBetweenNodes("cluster-1", "www.example.com").isVisible(), "edge cluster-1 --> www.example.com shown by filter");
    assert.ok(this.graph.getEdgeBetweenNodes("cluster-1", "test.com").isVisible(), "edge cluster-1 --> test.com shown by filter");
})