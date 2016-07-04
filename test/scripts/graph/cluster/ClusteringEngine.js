QUnit.module( "graph.cluster.ClusteringEngine", {
	
	beforeEach: function() {
		this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
		this.graph = new Graph(this.visualisationNetwork);
		this.graph.createDomainNode("www.example.com");
		this.graph.createDomainNode("another.example.com");
		this.graph.createDomainNode("test.com");
		this.graph.createDomainNode("dummy.com");
		this.graph.createDomainNode("test.co.uk");

		this.clusteringEngine = new ClusteringEngine(this.graph);
	}
});

QUnit.test("Cluster creation and deletion work successfully", function(assert) {
	var clusteringEngine = this.clusteringEngine;

	clusteringEngine.clusterByDomain(["example.com", "test.com"], "cluster-1");

	var cluster = clusteringEngine.getCluster("cluster-1");
	assert.ok(cluster != null, "Cluster was successfully created.");
	assert.equal(cluster.getNodes().length, 3, "All nodes have been successfully clustered");

	clusteringEngine.deCluster("cluster-1");
	var cluster = clusteringEngine.getCluster("cluster-1");
	assert.ok(cluster == null, "Cluster was successfully deleted.");
});

QUnit.test("Error thrown when attempting to create cluster with existing ID", function(assert) {
	var clusteringEngine = this.clusteringEngine;
	clusteringEngine.clusterByDomain(["example.com", "test.com"], "cluster-1");
	assert.throws(
		function() {
			clusteringEngine.clusterByDomain(["example.com", "dummy.com"], "cluster-1");
		},
		Error,
		"cannot create cluster with existing ID"
	);
});

QUnit.test("Error thrown when attempting to create cluster with only 1 contained node", function(assert) {
	var clusteringEngine = this.clusteringEngine;
	assert.throws(
		function() {
			clusteringEngine.clusterByDomain(["test"], "cluster-2");
		},
		Error,
		"cannot create cluster with only 1 containing node"
	);
});

QUnit.test("Clustering already clustered domain throws Error", function(assert) {
	var clusteringEngine = this.clusteringEngine;

	clusteringEngine.clusterByDomain(["example.com", "test.com"], "cluster-1");
	assert.throws(
		function() {
			clusteringEngine.clusterByDomain(["example.com", "dummy.com"], "cluster-2");
		},
		Error,
		"cannot create nested clustering"
	);
});