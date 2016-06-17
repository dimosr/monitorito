QUnit.module( "graph.cluster.ClusteringEngine", {
	beforeEach: function() {
		var graph = new sinon.createStubInstance(Graph);
		graph._network = {cluster: sinon.stub(), openCluster: sinon.stub()};

		var node1 = sinon.createStubInstance(Node);
		node1.getDomain.returns("example.com");
		node1.getID.returns("example.com");
		var node2 = sinon.createStubInstance(Node);
		node2.getDomain.returns("test.com");
		node2.getID.returns("test.com");
		var node3 = sinon.createStubInstance(Node);
		node3.getDomain.returns("another.example.com");
		node3.getID.returns("another.example.com");
		var node4 = sinon.createStubInstance(Node);
		node4.getDomain.returns("dummy.com");
		node4.getID.returns("dummy.com");
		this.nodes = [node1, node2, node3, node4];

		graph.getNodes.returns(this.nodes);

		this.clusteringEngine = new ClusteringEngine(graph);
	}
});

QUnit.test("creating Cluster from domains example.com, test.com", function(assert) {
	var clusteringEngine = this.clusteringEngine;
	var mockGraph = this.mockGraph;

	clusteringEngine.clusterByDomain(["example.com", "test.com"], "cluster-1");

	var cluster = clusteringEngine.getCluster("cluster-1");
	assert.ok(cluster != null, "Cluster was successfully created.");
	assert.equal(cluster.getNodes().length, 3, "All nodes have been successfully clustered");

	clusteringEngine.deCluster("cluster-1");
	var cluster = clusteringEngine.getCluster("cluster-1");
	assert.ok(cluster == null, "Cluster was successfully deleted.");
});