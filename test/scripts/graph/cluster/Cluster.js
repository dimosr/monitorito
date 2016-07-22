QUnit.module( "graph.cluster.Cluster", {

    beforeEach: function() {
        this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
        this.graph = new Graph(this.visualisationNetwork);
        this.graph.createDomainNode("www.example.com");
        this.graph.createDomainNode("another.example.com");
        this.graph.createDomainNode("test.com");
        this.graph.createDomainNode("dummy.com");
        this.graph.createDomainEdge("www.example.com", "another.example.com");
        this.graph.createDomainEdge("test.com", "another.example.com");

        var request = new HttpRequest(1, "GET", "http://another.example.com/lib", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");
        this.graph.getEdgeBetweenNodes("www.example.com", "another.example.com").addLink("http://www.example.com/", request, DomainEdge.LinkType.REQUEST);
        var redirect = new Redirect("http://test.com/", "http://another.example.com", HttpRequest.Type.ROOT, Date.now());
        this.graph.getEdgeBetweenNodes("test.com", "another.example.com").addLink(redirect.getInitialURL(), redirect, DomainEdge.LinkType.REDIRECT);

        this.resourcesExplorerEngine = new ResourcesExplorerEngine(this.graph);
        this.mockResourcesExplorerEngine = sinon.mock(this.resourcesExplorerEngine);
    }
});

QUnit.test("Creating a cluster, detaches included nodes and creates corresponding cluster node with edges", function(assert) {
    var clusteredNodes = [this.graph.getNode("www.example.com"), this.graph.getNode("test.com")];

    /* Collapsing all nodes included in cluster + neighbour nodes */
    this.mockResourcesExplorerEngine.expects("collapse").withArgs(this.graph.getNode("www.example.com")).atLeast(1);
    this.mockResourcesExplorerEngine.expects("collapse").withArgs(this.graph.getNode("test.com")).atLeast(1);
    this.mockResourcesExplorerEngine.expects("collapse").withArgs(this.graph.getNode("another.example.com")).atLeast(1);

    var cluster = new Cluster('cluster-1',clusteredNodes, sinon.createStubInstance(ClusterOptions), this.graph,  this.resourcesExplorerEngine);

    this.mockResourcesExplorerEngine.verify();

    /* Nodes contained in cluster hidden, as well as their edges */
    assert.notOk(this.graph.getNode("www.example.com").isVisible(), "clustered node hidden");
    assert.notOk(this.graph.getNode("test.com").isVisible(), "clustered node hidden");
    assert.ok(this.graph.getEdgeBetweenNodes("test.com", "another.example.com").isDetached(), "edge with inner node detached");
    assert.ok(this.graph.getEdgeBetweenNodes("www.example.com", "another.example.com").isDetached(), "edge with inner node detached");

    /* Cluster created with corresponding edges */
    assert.ok(cluster.getOutgoingDomainEdges().length == 1, "2 edges converted to 1 in the same node after clustering");
    assert.ok(cluster.hasEdgeTo(this.graph.getNode("another.example.com")), "edge correctly converted");
    assert.ok(cluster.getEdgeTo(this.graph.getNode("another.example.com")).getLinks(DomainEdge.LinkType.REQUEST).length == 1, "Request transferred correctly");
    assert.ok(cluster.getEdgeTo(this.graph.getNode("another.example.com")).getLinks(DomainEdge.LinkType.REDIRECT).length == 1, "Redirect transferred correctly");
})

QUnit.test("Deleting a cluster detaches the clustered nodes and re-shows their edges", function(assert) {
    var clusteredNodes = [this.graph.getNode("www.example.com"), this.graph.getNode("test.com")];
    var cluster = new Cluster('cluster-1',clusteredNodes, sinon.createStubInstance(ClusterOptions), this.graph,  this.resourcesExplorerEngine);

    cluster.delete();

    assert.notOk(this.graph.getNode("another.example.com").hasEdgeTo(cluster), "cluster edge deleted");
    assert.ok(this.graph.getNode("www.example.com").isVisible(), "clustered node shown back");
    assert.ok(this.graph.getNode("test.com").isVisible(), "clustered node shown back");
    assert.ok(this.graph.getNode("www.example.com").hasEdgeTo(this.graph.getNode("another.example.com")), "edge re-attached");
    assert.ok(this.graph.getNode("test.com").hasEdgeTo(this.graph.getNode("another.example.com")), "edge re-attached");
});