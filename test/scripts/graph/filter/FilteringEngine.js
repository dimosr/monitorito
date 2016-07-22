QUnit.module( "graph.filter.FilteringEngine", {
    beforeEach: function() {
        var factory = new GraphFactory();
        var graph = factory.buildGraph(Graph.Mode.ONLINE, jQuery("<canvas>")[0]);
        this.stubGraphStatsCalculator = sinon.createStubInstance(GraphStatsCalculator);

        this.filteringEngine = new FilteringEngine(graph, this.stubGraphStatsCalculator);
        this.filteringEngine.resetFilter();
        this.mockGraph = sinon.mock(graph);

        graph.createDomainNode("example.com");
        graph.createDomainNode("test.com");
        graph.createDomainNode("foo.com");
        graph.createDomainNode("bar.com");
        graph.createDomainEdge("example.com", "test.com");
        graph.createDomainEdge("foo.com", "bar.com");
        graph.createDomainEdge("foo.com", "test.com");
        graph.createResourceNode("https://test.com");
        graph.createResourceNode("https://test.com/lib");
        graph.createResourceEdge("https://test.com", "https://test.com/lib");
        this.graph = graph;


        this.filterOptions = sinon.createStubInstance(FilterOptions);

        this.filterOptions.satisfiedByNode.withArgs(graph.getNode("example.com")).returns(false);
        this.filterOptions.satisfiedByNode.withArgs(graph.getNode("test.com")).returns(true);
        this.filterOptions.satisfiedByNode.withArgs(graph.getNode("foo.com")).returns(true);
        this.filterOptions.satisfiedByNode.withArgs(graph.getNode("bar.com")).returns(false);
    }
});

QUnit.test("applying filter shows only matched nodes and edges between matched nodes", function(assert) {
    var graph = this.graph;
    this.filterOptions.getNeighboursDepth.returns(0);

    assert.notOk(this.filteringEngine.isFilterActive(), "Initially filter is disabled");

    this.filteringEngine.filter(this.filterOptions);

    assert.notOk(graph.getNode("example.com").isVisible(), "example.com filtered out");
    assert.ok(graph.getNode("test.com").isVisible(), "test.com matched");
    assert.ok(graph.getNode("https://test.com").isVisible(), "Resource https://test.com matched");
    assert.ok(graph.getNode("https://test.com/lib").isVisible(), "Resource https://test.com/lib matched");
    assert.ok(graph.getNode("foo.com").isVisible(), "foo.com matched");
    assert.notOk(graph.getNode("bar.com").isVisible(), "bar.com filtered out");

    assert.notOk(graph.getEdgeBetweenNodes("example.com", "test.com").isVisible(), "Edge example.com --> test.com hidden");
    assert.ok(graph.getEdgeBetweenNodes("foo.com", "test.com").isVisible(), "Edge foo.com --> test.com shown");
    assert.ok(graph.getEdgeBetweenNodes("https://test.com", "https://test.com/lib").isVisible(), "Edge 'https://test.com' --> 'https://test.com/lib' shown");
    assert.notOk(graph.getEdgeBetweenNodes("foo.com", "bar.com").isVisible(), "Edge foo.com --> bar.com hidden");

    assert.ok(this.filteringEngine.isFilterActive(), "filter enabled");

    this.filteringEngine.resetFilter();

    assert.notOk(this.filteringEngine.isFilterActive(), "Filter disabled after reset.");
});

QUnit.test("applying filter with traversing neighbours to depth 1, showing the whole graph", function(assert) {
    var graph = this.graph;
    this.filterOptions.getNeighboursDepth.returns(1);

    this.filteringEngine.filter(this.filterOptions);

    assert.ok(graph.getNode("example.com").isVisible(), "example.com shown, as neighbour in depth 1");
    assert.ok(graph.getNode("test.com").isVisible(), "test.com matched");
    assert.ok(graph.getNode("https://test.com").isVisible(), "Resource https://test.com matched");
    assert.ok(graph.getNode("https://test.com/lib").isVisible(), "Resource https://test.com/lib matched");
    assert.ok(graph.getNode("foo.com").isVisible(), "foo.com matched");
    assert.ok(graph.getNode("bar.com").isVisible(), "bar.com shown, as neighbour in depth 1");

    assert.ok(graph.getEdgeBetweenNodes("example.com", "test.com").isVisible(), "Edge example.com --> test.com shown");
    assert.ok(graph.getEdgeBetweenNodes("foo.com", "test.com").isVisible(), "Edge foo.com --> test.com shown");
    assert.ok(graph.getEdgeBetweenNodes("https://test.com", "https://test.com/lib").isVisible(), "Edge 'https://test.com' --> 'https://test.com/lib' shown");
    assert.ok(graph.getEdgeBetweenNodes("foo.com", "bar.com").isVisible(), "Edge foo.com --> bar.com shown");
});

QUnit.test("Multiple filters apply recursively over each other", function(assert) {
    var graph = this.graph;
    this.filterOptions.getNeighboursDepth.returns(0);

    var filterOptions = sinon.createStubInstance(FilterOptions);
    filterOptions.satisfiedByNode.withArgs(graph.getNode("example.com")).returns(false);
    filterOptions.satisfiedByNode.withArgs(graph.getNode("test.com")).returns(true);
    filterOptions.satisfiedByNode.withArgs(graph.getNode("foo.com")).returns(true);
    filterOptions.satisfiedByNode.withArgs(graph.getNode("bar.com")).returns(false);

    this.filteringEngine.filter(filterOptions);

    filterOptions.satisfiedByNode.withArgs(graph.getNode("example.com")).returns(true);
    filterOptions.satisfiedByNode.withArgs(graph.getNode("test.com")).returns(false);

    this.filteringEngine.filter(filterOptions);

    assert.notOk(graph.getNode("test.com").isVisible(), "test.com not visible, since it was filtered out in 2nd filtering");
    assert.notOk(graph.getNode("example.com").isVisible(), "example.com not visible, since it was filtered out in 1st filtering");
    assert.ok(graph.getNode("foo.com").isVisible(), "foo.com visible, since it was not filtered out in either filtering");
});