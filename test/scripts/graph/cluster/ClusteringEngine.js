QUnit.module( "graph.cluster.ClusteringEngine", {
	
	beforeEach: function() {
		this.graph = sinon.createStubInstance(Graph);

		this.clusteringEngine = new ClusteringEngine(this.graph);
	}
});

QUnit.test("clustering functionalities", function(assert) {
	var clusteringEngine = this.clusteringEngine;

	var node1 = sinon.createStubInstance(DomainNode);
	node1.getDomain.returns("www.example.com");
	node1.getID.returns("www.example.com");
	node1.getOutgoingDomainEdges.returns([]);
	node1.getIncomingDomainEdges.returns([]);
	var node2 = sinon.createStubInstance(DomainNode);
	node2.getDomain.returns("another.example.com");
	node2.getID.returns("another.example.com");
	node2.getOutgoingDomainEdges.returns([]);
	node2.getIncomingDomainEdges.returns([]);
	var node3 = sinon.createStubInstance(DomainNode);
	node3.getDomain.returns("test.com");
	node3.getID.returns("test.com");
	node3.getOutgoingDomainEdges.returns([]);
	node3.getIncomingDomainEdges.returns([]);
	var node4 = sinon.createStubInstance(DomainNode);
	node4.getDomain.returns("dummy.com");
	node4.getID.returns("dummy.com");
	node4.getOutgoingDomainEdges.returns([]);
	node4.getIncomingDomainEdges.returns([]);
	var node5 = sinon.createStubInstance(DomainNode);
	node5.getDomain.returns("test.co.uk");
	node5.getID.returns("test.co.uk");
	node5.getOutgoingDomainEdges.returns([]);
	node5.getIncomingDomainEdges.returns([]);
	
	this.graph.getDomainNodes.returns([node1, node2, node3, node4]);

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