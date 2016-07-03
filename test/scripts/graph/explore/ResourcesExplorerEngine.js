QUnit.module( "graph.explore.ResourcesExplorerEngine", {
    beforeEach: function() {
        this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
        this.graph = new Graph(this.visualisationNetwork);

        this.resourcesExplorerEngine = new ResourcesExplorerEngine(this.graph);

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
        edge1.addLink("http://example.com", redirect, DomainEdge.Type.REDIRECT);
        edge2.addLink("http://example.com", request3, DomainEdge.Type.REQUEST);
    }
});

QUnit.test("expanding domain node creates ResourceNodes and ResourceEdges from domain to resource nodes", function(assert) {
    var resourcesExplorerEngine = this.resourcesExplorerEngine;
    var graph = this.graph;

    resourcesExplorerEngine.expand(graph.getNode("example.com"));

    assert.ok(graph.existsNode("http://example.com"), "ResourceNode successfully created");
    assert.ok(graph.existsEdge("http://example.com", "www.example.com"), "ResourceEdge created between ResourceNode and not-expanded domain");
    assert.ok(graph.existsEdge("http://example.com", "test.com"), "ResourceEdge created between ResourceNode and not-expanded domain");
});

QUnit.test("expanding 2 domain nodes creates ResourceEdge between the corresponding ResourceNodes, not between DomainNode", function(assert) {
    var resourcesExplorerEngine = this.resourcesExplorerEngine;
    var graph = this.graph;

    resourcesExplorerEngine.expand(graph.getNode("example.com"));
    resourcesExplorerEngine.expand(graph.getNode("test.com"));

    assert.ok(graph.existsNode("http://example.com"), "ResourceNode successfully created");
    assert.ok(graph.existsNode("http://test.com"), "ResourceNode successfully created");
    assert.ok(graph.existsEdge("http://example.com", "www.example.com"), "ResourceEdge created between ResourceNode and not expanded DomainNode");
    assert.ok(!graph.existsEdge("http://example.com", "test.com"), "No ResourceEdge with expanded DomainNode");
    assert.ok(graph.existsEdge("http://example.com", "http://test.com"), "ResourceEdge created between ResourceNodes");
});

QUnit.test("collapsing DomainNode removes ResourceNodes", function(assert) {
    var resourcesExplorerEngine = this.resourcesExplorerEngine;
    var graph = this.graph;

    resourcesExplorerEngine.expand(graph.getNode("example.com"));
    resourcesExplorerEngine.collapse(graph.getNode("example.com"));

    assert.ok(!graph.existsNode("http://example.com"), "ResourceNode successfully deleted");
});


QUnit.test("collapsing DomainNode with other expanded maintains ResourceEdges with domain", function(assert) {
    var resourcesExplorerEngine = this.resourcesExplorerEngine;
    var graph = this.graph;

    resourcesExplorerEngine.expand(graph.getNode("example.com"));
    resourcesExplorerEngine.expand(graph.getNode("test.com"));
    resourcesExplorerEngine.collapse(graph.getNode("example.com"));

    assert.ok(!graph.existsNode("http://example.com"), "ResourceNode successfully deleted");
    assert.ok(graph.existsNode("http://test.com"), "ResourceNode of non-collapsed node already exists");
    assert.ok(!graph.existsEdge("example.com", "http://test.com"), "ResourceEdge maintained between domain and non-collapsed ResourceDomain");
});