QUnit.module( "graph.cluster.ClusteringEngine", {
	
	beforeEach: function() {
		this.graph = sinon.createStubInstance(Graph);

		this.clusteringEngine = new ClusteringEngine(this.graph);
	}
});

QUnit.test("clustering functionalities", function(assert) {
	var clusteringEngine = this.clusteringEngine;

	var node1 = sinon.createStubInstance(Node);
	node1.getDomain.returns("www.example.com");
	node1.getID.returns("www.example.com");
	node1.getOutgoingEdges.returns([]);
	node1.getIncomingEdges.returns([]);
	var node2 = sinon.createStubInstance(Node);
	node2.getDomain.returns("another.example.com");
	node2.getID.returns("another.example.com");
	node2.getOutgoingEdges.returns([]);
	node2.getIncomingEdges.returns([]);
	var node3 = sinon.createStubInstance(Node);
	node3.getDomain.returns("test.com");
	node3.getID.returns("test.com");
	node3.getOutgoingEdges.returns([]);
	node3.getIncomingEdges.returns([]);
	var node4 = sinon.createStubInstance(Node);
	node4.getDomain.returns("dummy.com");
	node4.getID.returns("dummy.com");
	node4.getOutgoingEdges.returns([]);
	node4.getIncomingEdges.returns([]);
	var node5 = sinon.createStubInstance(Node);
	node5.getDomain.returns("test.co.uk");
	node5.getID.returns("test.co.uk");
	node5.getOutgoingEdges.returns([]);
	node5.getIncomingEdges.returns([]);
	
	this.graph.getNodes.returns([node1, node2, node3, node4]);

	clusteringEngine.clusterByDomain(["example.com", "test.com"], "cluster-1");

	var cluster = clusteringEngine.getCluster("cluster-1");
	assert.ok(cluster != null, "Cluster was successfully created.");
	assert.equal(cluster.getNodes().length, 3, "All nodes have been successfully clustered");

	assert.throws(
		function() {
			clusteringEngine.clusterByDomain(["example.com", "dummy.com"], "cluster-1");
		}, 
		Error,
		"cannot create cluster with existing ID"
	);

	assert.throws(
		function() {
			clusteringEngine.clusterByDomain(["test"], "cluster-2");
		},
		Error,
		"cannot create cluster with only 1 containing node"
	);

	clusteringEngine.deCluster("cluster-1");
	var cluster = clusteringEngine.getCluster("cluster-1");
	assert.ok(cluster == null, "Cluster was successfully deleted.");
});