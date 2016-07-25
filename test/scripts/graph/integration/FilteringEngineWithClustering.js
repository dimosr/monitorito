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

QUnit.test("Filtering applied before Clustering: there are filtered-out nodes that would otherwise be clustered", function(assert) {
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

QUnit.test("Filtering applied before Clustering: no filtered-out nodes that would be clustered, but there are filtered-out nodes that would be neighbours of the cluster", function(assert) {
    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("^((test\.com)|(www\.example\.com)|(dummy\.com))$"));
    this.filteringEngine.filter(filterOptions);

    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com", "dummy.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    assert.ok(this.graph.getNode("cluster-1").getNodes().length == 3, "All 3 nodes to be clustered were not filtered-out");
    assert.ok(this.graph.getNode("cluster-1").getNodes().indexOf(this.graph.getNode("www.example.com")) >= 0, "www.example.com included in the cluster");
    assert.ok(this.graph.getNode("cluster-1").getNodes().indexOf(this.graph.getNode("test.com")) >= 0, "test.com included in the cluster");
    assert.ok(this.graph.getNode("cluster-1").getNodes().indexOf(this.graph.getNode("dummy.com")) >= 0, "dummy.com included in the cluster");
    assert.ok(this.graph.existsEdge("example.com", "cluster-1") && !this.graph.getEdgeBetweenNodes("example.com", "cluster-1").isVisible(), "edge between filtered-out node and cluster created, but hidden");
});

QUnit.test("Clustering applied before filtering: Create a cluster and filter only that with depth = 0", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.REGEXP);
    clusterOptions.setRegExp(new RegExp("^((example\.com)|(dummy\.com))$"));
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");
    filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(cluster-1)(.*)"));
    this.filteringEngine.filter(filterOptions);

    assert.ok(this.clusteringEngine.getCluster("cluster-1").isVisible(), "cluster matched by filter");
    assert.ok(!this.node1.isVisible(), "www.example.com not matched by filter, thus not shown since neighbour depth equals 0");
    assert.ok(!this.node3.isVisible(), "test.com not matched by filter, thus not shown since neighbour depth equals 0");
    assert.ok(this.graph.existsEdge("cluster-1", "www.example.com") && !this.graph.getEdgeBetweenNodes("cluster-1", "www.example.com").isVisible(), "edge cluster-1 --> www.example.com created, but hidden by filter");
    assert.ok(this.graph.existsEdge("cluster-1", "test.com") && !this.graph.getEdgeBetweenNodes("cluster-1", "test.com").isVisible(), "edge cluster-1 --> test.com created, but hidden by filter");
});

QUnit.test("Clustering applied before filtering: Create cluster and filter only that with depth > 0 (outgoing neighbours exist)", function(assert) {
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
});

QUnit.test("Clustering applied before filtering: Create cluster and filter only that with depth > 0 (incoming neighbours exist)", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");
    filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(cluster-1)(.*)"));
    filterOptions.setNeighboursDepth(1);
    this.filteringEngine.filter(filterOptions);

    assert.ok(this.clusteringEngine.getCluster("cluster-1").isVisible(), "cluster matched by filter");
    assert.ok(this.node2.isVisible(), "example.com not matched by filter, but shown as neighbour of cluster");
    assert.ok(!this.node4.isVisible(), "dummy.com not matched by filter");
    assert.ok(this.graph.existsEdge("example.com", "cluster-1") && this.graph.getEdgeBetweenNodes("example.com", "cluster-1").isVisible(), "edge example.com --> cluster-1 shown by filter");
});

QUnit.test("Clustering applied before filtering: Create cluster and filter the clustered nodes", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(www\.example\.com)|(test\.com)(.*)"));
    this.filteringEngine.filter(filterOptions);

    assert.ok(!this.graph.getNode("www.example.com").isVisible(), "www.example.com satisfies filter, but is not investigated by filtering, since it is clustered");
    assert.ok(!this.graph.getNode("test.com").isVisible(), "test.com satisfies filter, but is not investigated by filtering, since it is clustered");
});

QUnit.test("Clustering applied before filtering: Create 2 connected clusters and filter one of them with depth = 0", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["example.com"]);     //matches example.com && www.example.com
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["dummy.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-2");

    filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(cluster-1)(.*)"));
    this.filteringEngine.filter(filterOptions);

    assert.ok(this.graph.getNode("cluster-1").isVisible(), "Cluster 'cluster-1' was matched by filter");
    assert.ok(!this.graph.getNode("cluster-2").isVisible(), "Cluster 'cluster-2' was not matched by filter");
});

QUnit.test("Clustering applied before filtering: Create 2 connected clusters and filter one of them with depth > 0 (incoming neighbours exists)", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["example.com"]);     //matches example.com && www.example.com
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["dummy.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-2");

    filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(cluster-2)(.*)"));
    filterOptions.setNeighboursDepth(1);
    this.filteringEngine.filter(filterOptions);

    assert.ok(this.graph.getNode("cluster-2").isVisible(), "Cluster 'cluster-2' is visible, since matched by filter");
    assert.ok(this.graph.getNode("cluster-1").isVisible(), "Cluster 'cluster-1' was not matched by filter, but is shown, since it is direct neighbour of 'cluster-1");
});

QUnit.test("Clustering applied before filtering: Create 2 connected clusters and filter one of them with depth > 0 (outgoing neighbours exist)", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["example.com"]);     //matches example.com && www.example.com
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["dummy.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-2");

    filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("(.*)(cluster-1)(.*)"));
    filterOptions.setNeighboursDepth(1);
    this.filteringEngine.filter(filterOptions);

    assert.ok(this.graph.getNode("cluster-1").isVisible(), "Cluster 'cluster-1' is visible, since matched by filter");
    assert.ok(this.graph.getNode("cluster-2").isVisible(), "Cluster 'cluster-2' was not matched by filter, but is shown, since it is direct neighbour of 'cluster-1");
});