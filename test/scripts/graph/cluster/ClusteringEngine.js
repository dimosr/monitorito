QUnit.module( "graph.cluster.ClusteringEngine", {
	
	beforeEach: function() {
		this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
		this.graph = new Graph(this.visualisationNetwork);
		this.graph.createDomainNode("www.example.com");
		this.graph.createDomainNode("another.example.com");
		this.graph.createDomainNode("test.com");
		this.graph.createDomainNode("dummy.com");

		var resourcesExplorerEngine = new ResourcesExplorerEngine(this.graph);
		this.mockResourcesExplorerEngine = sinon.mock(resourcesExplorerEngine);

		this.clusteringEngine = new ClusteringEngine(this.graph, resourcesExplorerEngine);

		this.graph.setClusteringEngine(this.clusteringEngine);
	}
});

QUnit.test("Cluster creation and deletion work successfully", function(assert) {
	this.graph.createDomainEdge("www.example.com", "test.com");
	this.graph.createDomainEdge("another.example.com", "dummy.com");
	this.graph.createDomainEdge("www.example.com", "another.example.com");
	var clusteringEngine = this.clusteringEngine;

	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);

	clusteringEngine.cluster(clusterOptions, "cluster-1");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().length == 2, "Cluster contains 2 nodes");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().indexOf(this.graph.getNode("www.example.com")) >= 0, "www.example.com clustered");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().indexOf(this.graph.getNode("another.example.com")) >= 0, "another.example.com clustered");

	clusteringEngine.deCluster("cluster-1");
	assert.ok(clusteringEngine.getCluster("cluster-1") == null, "Cluster was successfully deleted.");
});

QUnit.test("Error thrown when attempting to create cluster with existing ID", function(assert) {
	var clusteringEngine = this.clusteringEngine;
	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.returns(true);

	clusteringEngine.cluster(clusterOptions, "cluster-1");
	assert.throws(
		function() {
			clusteringEngine.cluster(clusterOptions, "cluster-1");
		},
		Error,
		"cannot create cluster with existing ID"
	);
});

QUnit.test("Error thrown when attempting to create cluster with only 1 contained node", function(assert) {
	var clusteringEngine = this.clusteringEngine;
	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(false);

	assert.throws(
		function() {
			clusteringEngine.cluster(clusterOptions, "cluster-2");
		},
		Error,
		"cannot create cluster with only 1 containing node"
	);
});

QUnit.test("Clustering already clustered domain throws Error", function(assert) {
	var clusteringEngine = this.clusteringEngine;
	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(false);

	clusteringEngine.cluster(clusterOptions, "cluster-1");

	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(true);
	assert.throws(
		function() {
			clusteringEngine.cluster(clusterOptions, "cluster-2");
		},
		Error,
		"cannot create nested clustering"
	);
});

QUnit.test("Editing only existing clusters", function(assert) {
	var clusteringEngine = this.clusteringEngine;
	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);

	assert.throws(
		function() {
			clusteringEngine.editCluster(clusterOptions, "cluster");
		},
		Error,
		"cannot edit non-existing cluster"
	);
});

QUnit.test("Editing cluster works successfully, when new cluster is valid", function(assert) {
	this.graph.createDomainEdge("www.example.com", "test.com");
	this.graph.createDomainEdge("another.example.com", "dummy.com");
	this.graph.createDomainEdge("www.example.com", "another.example.com");
	var clusteringEngine = this.clusteringEngine;

	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusteringEngine.cluster(clusterOptions, "cluster-1");

	clusteringEngine.editCluster(clusterOptions, "cluster-1");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().length == 2, "Cluster contains 2 nodes");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().indexOf(this.graph.getNode("www.example.com")) >= 0, "www.example.com clustered");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().indexOf(this.graph.getNode("another.example.com")) >= 0, "another.example.com clustered");

	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(true);
	clusteringEngine.editCluster(clusterOptions, "cluster-1");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().length == 3, "Cluster contains 3 nodes");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().indexOf(this.graph.getNode("www.example.com")) >= 0, "www.example.com clustered");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().indexOf(this.graph.getNode("another.example.com")) >= 0, "another.example.com clustered");
	assert.ok(clusteringEngine.getCluster("cluster-1").getNodes().indexOf(this.graph.getNode("dummy.com")) >= 0, "dummy.com also clustered");
});

QUnit.test("Editing cluster does not work successfully, when new cluster is invalid", function(assert) {
	this.graph.createDomainEdge("www.example.com", "test.com");
	this.graph.createDomainEdge("another.example.com", "dummy.com");
	this.graph.createDomainEdge("www.example.com", "another.example.com");
	var clusteringEngine = this.clusteringEngine;

	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	assert.throws(
		function() {
			clusteringEngine.cluster(clusterOptions, "cluster-1");
		},
		Error,
		"new cluster contains only 1 node"
	);

	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusteringEngine.cluster(clusterOptions, "cluster-1");

	clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	assert.throws(
		function() {
			clusteringEngine.cluster(clusterOptions, "cluster-2");
		},
		Error,
		"node www.example.com contained in cluster-2"
	);

	clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(true);
	assert.throws(
		function() {
			clusteringEngine.cluster(clusterOptions, "cluster-1");
		},
		Error,
		"Already exists cluster with the same ID"
	);
});

QUnit.test("Delete cluster does not create duplicate edges", function(assert) {
	this.graph.createDomainEdge("www.example.com", "test.com");
	this.graph.createDomainEdge("www.example.com", "dummy.com");
	var clusteringEngine = this.clusteringEngine;

	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusteringEngine.cluster(clusterOptions, "example-cluster");

	clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(true);
	clusteringEngine.cluster(clusterOptions, "dep-cluster");

	clusteringEngine.deCluster("example-cluster");
	/* If duplicate edge is created, exception will be raised */
	assert.ok(true, "No duplicate edge created");
})

QUnit.test("deleteAllClusters()", function(assert) {
	var clusteringEngine = this.clusteringEngine;
	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(false);

	clusteringEngine.cluster(clusterOptions, "cluster-1");

	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(true);

	clusteringEngine.cluster(clusterOptions, "cluster-2");

	assert.ok(clusteringEngine.getCluster("cluster-1") != null, "Cluster 1 was successfully created.");
	assert.ok(clusteringEngine.getCluster("cluster-2") != null, "Cluster 2 was successfully created.");

	clusteringEngine.deClusterAll();

	assert.equal(clusteringEngine.getClusters().length, 0, "All Clusters were successfully deleted.");
});

QUnit.test("Clustering detaches node edges and creates corresponding edges between cluster and nodes", function(assert) {
	this.graph.createDomainEdge("test.com", "www.example.com");
	this.graph.createDomainEdge("test.com", "another.example.com");

	var clusteringEngine = this.clusteringEngine;
	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(false);

	clusteringEngine.cluster(clusterOptions, "cluster-1");

	assert.ok(this.graph.getEdgeBetweenNodes("test.com", "www.example.com").isDetached(), "edge to clustered node detached");
	assert.ok(this.graph.getEdgeBetweenNodes("test.com", "another.example.com").isDetached(), "edge to clustered node detached");

	assert.ok(this.graph.existsEdge("test.com", "cluster-1"), "edge created between node and created cluster");
});

QUnit.test("Graph returns all the nodes and edges (attached & detached), no matter active clusters", function(assert) {
	var edge1 = this.graph.createDomainEdge("test.com", "www.example.com");
	var edge2 = this.graph.createDomainEdge("test.com", "another.example.com");

	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(false);

	this.clusteringEngine.cluster(clusterOptions, "cluster-1");

	var nodes = this.graph.getDomainNodes();
	var edges = this.graph.getDomainEdges();

	assert.ok(nodes.length == 4, "All nodes returned");
	assert.ok(edges.length == 2, "All edges returned");
	assert.ok(nodes.indexOf(this.graph.getNode("www.example.com") >= 0), "www.example.com returned");
	assert.ok(nodes.indexOf(this.graph.getNode("another.example.com") >= 0), "another.example.com returned");
	assert.ok(nodes.indexOf(this.graph.getNode("test.com") >= 0), "test.com returned");
	assert.ok(nodes.indexOf(this.graph.getNode("dummy.com") >= 0), "dummy.com returned");
	assert.ok(edges.indexOf(edge1) >= 0, "edge test.com --> www.example.com returned");
	assert.ok(edges.indexOf(edge2) >= 0, "edge test.com --> another.example.com returned");
})

QUnit.test("Create 2 clusters that are connected", function(assert) {
	var edge1 = this.graph.createDomainEdge("test.com", "another.example.com");
	var edge2 = this.graph.createDomainEdge("dummy.com", "www.example.com");

	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(true);
	this.clusteringEngine.cluster(clusterOptions, "cluster-1");
	assert.ok(this.graph.getNode("cluster-1").isVisible(), "cluster-1 created");
	assert.ok(!this.graph.getNode("www.example.com").isVisible(), "clustered node detached");
	assert.ok(!this.graph.getNode("test.com").isVisible(), "clustered node detached");
	assert.ok(this.graph.getEdgeBetweenNodes("dummy.com", "www.example.com").isDetached(), "edge of clustered node detached");
	assert.ok(this.graph.getEdgeBetweenNodes("test.com", "another.example.com").isDetached(), "edge of clustered node detached");
	assert.ok(this.graph.getEdgeBetweenNodes("cluster-1", "another.example.com").isVisible(), "edge cluster-1 --> another.example.com created between cluster and node");
	assert.ok(this.graph.getEdgeBetweenNodes("dummy.com", "cluster-1").isVisible(), "edge dummy.com --> cluster-1 created between cluster and node");
	assert.ok(this.clusteringEngine.getClusters().length == 1, "correct number of clusters returned");
	assert.ok(this.clusteringEngine.getClustersEdges().length == 2, "correct number of clusters edges returned");


	var clusterOptions2 = sinon.createStubInstance(ClusterOptions);
	clusterOptions2.belongsInCluster.returns(false);
	clusterOptions2.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusterOptions2.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(true);
	this.clusteringEngine.cluster(clusterOptions2, "cluster-2");
	assert.ok(this.graph.getNode("cluster-2").isVisible(), "cluster-2 created");
	assert.ok(!this.graph.getNode("another.example.com").isVisible(), "clustered node detached");
	assert.ok(!this.graph.getNode("dummy.com").isVisible(), "clustered node detached");
	assert.ok(!this.graph.existsEdge("cluster-1", "another.example.com"), "edge cluster-1 --> another.example.com deleted");
	assert.ok(this.graph.getEdgeBetweenNodes("cluster-1", "cluster-2").isVisible(), "corresponding edge cluster-1 --> cluster-2 created");
	assert.ok(!this.graph.existsEdge("dummy.com", "cluster-1"), "edge dummy.com --> cluster-1 deleted");
	assert.ok(this.graph.getEdgeBetweenNodes("cluster-2", "cluster-1").isVisible(), "corresponding edge cluster-2 --> cluster-1 created");
	assert.ok(this.clusteringEngine.getClusters().length == 2, "correct number of clusters returned");
	assert.ok(this.clusteringEngine.getClustersEdges().length == 2, "correct number of clusters edges returned");

	this.clusteringEngine.deCluster("cluster-1");
	assert.ok(this.graph.getNode("www.example.com").isVisible(), "www.example.com attached back");
	assert.ok(this.graph.getNode("test.com").isVisible(), "test.com attached back");
	assert.ok(this.graph.getEdgeBetweenNodes("dummy.com", "www.example.com").isDetached(), "edge dummy.com --> www.example.com between nodes still detached");
	assert.ok(this.graph.getEdgeBetweenNodes("dummy.com", "www.example.com").isDetached(), "edge test.com --> another.example.com between nodes still detached");
	assert.ok(this.graph.getEdgeBetweenNodes("cluster-2", "www.example.com").isVisible(), "edge cluster-2 --> www.example.com created");
	assert.ok(this.graph.getEdgeBetweenNodes("test.com", "cluster-2").isVisible(), "edge test.com --> cluster-2 created");
	assert.ok(this.clusteringEngine.getClusters().length == 1, "correct number of clusters returned");
	assert.ok(this.clusteringEngine.getClustersEdges().length == 2, "correct number of clusters edges returned");

	this.clusteringEngine.deCluster("cluster-2");
	assert.ok(this.graph.getNode("another.example.com").isVisible(), "another.example.com attached back");
	assert.ok(this.graph.getNode("dummy.com").isVisible(), "dummy.com attached back");
	assert.ok(!this.graph.getEdgeBetweenNodes("dummy.com", "www.example.com").isDetached(), "edge dummy.com --> www.example.com attached back");
	assert.ok(!this.graph.getEdgeBetweenNodes("dummy.com", "www.example.com").isDetached(), "edge test.com --> another.example.com attached back");
	assert.ok(this.clusteringEngine.getClusters().length == 0, "correct number of clusters returned");
	assert.ok(this.clusteringEngine.getClustersEdges().length == 0, "correct number of clusters edges returned");
});