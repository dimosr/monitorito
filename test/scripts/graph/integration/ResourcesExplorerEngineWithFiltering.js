QUnit.module( "graph.integration.ResourcesExplorerEngineWithFiltering", {
    beforeEach: function() {
        this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
        this.graph = new Graph(this.visualisationNetwork);

        this.resourcesExplorerEngine = new ResourcesExplorerEngine(this.graph);

        var clusteringEngine = new ClusteringEngine(this.graph, this.resourcesExplorerEngine);
        this.graph.setClusteringEngine(clusteringEngine);

        this.graphStatsCalculator = new GraphStatsCalculator();
        this.filteringEngine = new FilteringEngine(this.graph, this.graphStatsCalculator);
        this.filteringEngine.resetFilter();

        var node1 = this.graph.createDomainNode("www.example.com");
        var node2 = this.graph.createDomainNode("example.com");
        var node3 = this.graph.createDomainNode("test.com");
        var edge1 = this.graph.createDomainEdge("example.com", "www.example.com");
        var edge2 = this.graph.createDomainEdge("example.com", "test.com");
        var request1 = new HttpRequest(1, "GET", "http://example.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        var redirect = new Redirect("http://example.com", "http://www.example.com", HttpRequest.Type.ROOT, Date.now());
        var request2 = new HttpRequest(2, "GET", "http://www.example.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        var request3 = new HttpRequest(3, "GET", "http://test.com", Date.now(), {}, HttpRequest.Type.EMBEDDED, "sub_frame");
        node1.addRequest(request1);
        node2.addRequest(request2);
        node3.addRequest(request3);
        edge1.addLink("http://example.com", redirect, DomainEdge.LinkType.REDIRECT);
        edge2.addLink("http://example.com", request3, DomainEdge.LinkType.REQUEST);
    }
});

QUnit.test("Expanding applied before filtering: expand domain node & filter-out nodes that have incoming resource edges from it", function(assert) {
    this.resourcesExplorerEngine.expand(this.graph.getNode("example.com"));

    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp(".*(example\.com).*"));
    this.filteringEngine.filter(filterOptions);

    assert.ok(this.graph.existsEdge("http://example.com", "test.com") && !this.graph.getEdgeBetweenNodes("http://example.com", "test.com").isVisible(), "edge http://example.com --> test.com hidden by filter, since test.com was filtered out");
    assert.ok(this.graph.existsEdge("http://example.com", "www.example.com") && this.graph.getEdgeBetweenNodes("http://example.com", "www.example.com").isVisible(), "edge http://example.com --> www.example.com not hidden by filter, since test.com was not filtered out");
});

QUnit.test("Expanding applied before filtering: expand domain node & filter-out this node", function(assert) {
    this.resourcesExplorerEngine.expand(this.graph.getNode("example.com"));

    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp(".*(test\.com).*"));
    this.filteringEngine.filter(filterOptions);

    assert.ok(this.graph.existsEdge("http://example.com", "test.com") && !this.graph.getEdgeBetweenNodes("http://example.com", "test.com").isVisible(), "edge http://example.com --> test.com hidden by filter, since example.com was filtered out");
});

QUnit.test("Expanding applied after filtering: filter the graph & expand domain node that has outgoing edges to nodes that were previously filtered out", function(assert) {
    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp(".*(example\.com).*"));
    this.filteringEngine.filter(filterOptions);

    this.resourcesExplorerEngine.expand(this.graph.getNode("example.com"));

    assert.ok(this.graph.existsEdge("http://example.com", "test.com") && !this.graph.getEdgeBetweenNodes("http://example.com", "test.com").isVisible(), "edge http://example.com --> test.com created, but hidden, because test.com was previously filtered out");

    this.filteringEngine.resetFilter();
    assert.ok(this.graph.getEdgeBetweenNodes("http://example.com", "test.com").isVisible(), "edge shown after resetting the filter");
});

QUnit.test("Resetting the filtering does not affect the inter-domain edges hidden & locked by ResourcesExplorerEngine", function(assert) {
    this.resourcesExplorerEngine.expand(this.graph.getNode("test.com"));
    assert.notOk(this.graph.getEdgeBetweenNodes("example.com", "test.com").isVisible(), "Inter-domain edge successfully hidden");
    assert.ok(this.graph.getEdgeBetweenNodes("example.com", "http://test.com").isVisible(), "Edge between domain and resource visible");

    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp(".*(test.com).*"));
    this.filteringEngine.filter(filterOptions);
    assert.ok(this.graph.getNode("test.com").isVisible(), "test.com matched by filtering, thus visible");
    assert.ok(this.graph.getNode("http://test.com").isVisible(), "http://test.com child of matched node (test.com), thus visible");
    assert.notOk(this.graph.getEdgeBetweenNodes("example.com", "http://test.com").isVisible(), "Edge between domain and resource not visible, because example.com filtered out");

    this.filteringEngine.resetFilter();
    assert.ok(this.graph.getNode("test.com").isVisible(), "test.com visible, since filter was reset");
    assert.ok(this.graph.getNode("example.com").isVisible(), "example.com visible, since filter was reset");
    assert.ok(this.graph.getNode("www.example.com").isVisible(), "www.example.com visible, since filter was reset");
    assert.notOk(this.graph.getEdgeBetweenNodes("example.com", "test.com").isVisible(), "Inter-domain edge still hidden, because locked by ResourcesExplorerEngine");
    assert.ok(this.graph.getEdgeBetweenNodes("example.com", "http://test.com").isVisible(), "Edge between domain and resource now visible, because both nodes visible, since filter was reset");
});

QUnit.test("Successive expands-collapses, while filtering is active", function(assert) {
    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("^((test.com)|(example.com))$"));
    this.filteringEngine.filter(filterOptions);

    assert.ok(this.graph.getNode("test.com").isVisible(), "test.com matched by filtering, thus visible");
    assert.ok(this.graph.getNode("example.com").isVisible(), "example.com matched by filtering, thus visible");
    assert.notOk(this.graph.getNode("www.example.com").isVisible(), "www.example.com not matched by filtering, thus hidden");

    this.resourcesExplorerEngine.expand(this.graph.getNode("example.com"));
    assert.ok(this.graph.getNode("http://example.com").isVisible(), "resource visible, since parent node matched");
    assert.notOk(this.graph.getEdgeBetweenNodes("http://example.com", "www.example.com").isVisible(), "resource edge not visible, since www.example.com is filtered out");
    assert.notOk(this.graph.getEdgeBetweenNodes("example.com", "test.com").isVisible(), "inter-domain edge successfully hidden, due to corresponding resource edge createds");
    assert.ok(this.graph.getEdgeBetweenNodes("http://example.com", "test.com").isVisible(), "resource edge visible, since test.com was matched by filter");

    this.resourcesExplorerEngine.expand(this.graph.getNode("test.com"));
    assert.ok(this.graph.getNode("http://test.com").isVisible(), "resource visible, since parent node matched");
    assert.notOk(this.graph.getEdgeBetweenNodes("example.com", "test.com").isVisible(), "inter-domain edge still hidden");
    assert.notOk(this.graph.existsEdge("http://example.com", "test.com"), "edge to test.com not existing, because transferred to resource");
    assert.ok(this.graph.getEdgeBetweenNodes("http://example.com", "http://test.com").isVisible(), "resource edge moved to http://test.com");

    this.resourcesExplorerEngine.collapse(this.graph.getNode("test.com"));
    assert.notOk(this.graph.existsNode("http://test.com"), "resource not existing, since parent node collapsed");
    assert.notOk(this.graph.getEdgeBetweenNodes("example.com", "test.com").isVisible(), "inter-domain edge still hidden");
    assert.ok(this.graph.getEdgeBetweenNodes("http://example.com", "test.com").isVisible(), "resource edge moved back to test.com");
    assert.notOk(this.graph.existsEdge("http://example.com", "http://test.com"), "resource edge to resource node not existing, since transferred to domain");

    this.resourcesExplorerEngine.collapse(this.graph.getNode("example.com"));
    assert.notOk(this.graph.existsNode("http://example.com"), "resource not existing, since parent node collapsed");
    assert.ok(this.graph.getEdgeBetweenNodes("example.com", "test.com").isVisible(), "inter-domain edge unlocked and shown again");
});

QUnit.test("expandAllNodes() operates only on visible (filtered) nodes", function(assert) {
    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("^((test.com))$"));
    this.filteringEngine.filter(filterOptions);

    this.resourcesExplorerEngine.expandAllNodes();

    this.filteringEngine.resetFilter();
    assert.ok(this.graph.getNode("test.com").isExpanded(), "test.com was not filtered-out, so it got expanded");
    assert.ok(!this.graph.getNode("example.com").isExpanded(), "example.com was filtered-out, so it did not get expanded");
    assert.ok(!this.graph.getNode("www.example.com").isExpanded(), "www.example.com was filtered-out, so it did not get expanded");
});

QUnit.test("collapseAllNodes() operates only on visible (filtered) nodes", function(assert) {
    this.resourcesExplorerEngine.expand(this.graph.getNode("example.com"));

    var filterOptions = new FilterOptions();
    filterOptions.setDomainRegExp(new RegExp("^((test.com))$"));
    this.filteringEngine.filter(filterOptions);

    this.resourcesExplorerEngine.collapseAllNodes();

    this.filteringEngine.resetFilter();
    assert.ok(this.graph.getNode("example.com").isExpanded(), "example.com is still expanded, because it was filtered out during the collapseAllNodes()")
});