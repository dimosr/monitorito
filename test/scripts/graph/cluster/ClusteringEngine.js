QUnit.module( "graph.cluster.ClusteringEngine", {
	
	beforeEach: function() {
		this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
		this.graph = new Graph(this.visualisationNetwork);
		this.graph.createDomainNode("www.example.com");
		this.graph.createDomainNode("another.example.com");
		this.graph.createDomainNode("test.com");
		this.graph.createDomainNode("dummy.com");

		this.clusteringEngine = new ClusteringEngine(this.graph);
	}
});

QUnit.test("Cluster creation and deletion work successfully", function(assert) {
	var clusteringEngine = this.clusteringEngine;

	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(true);

	clusteringEngine.cluster(clusterOptions, "cluster-1");

	var cluster = clusteringEngine.getCluster("cluster-1");
	assert.ok(cluster != null, "Cluster was successfully created.");
	assert.equal(cluster.getNodes().length, 3, "All nodes have been successfully clustered");

	clusteringEngine.deCluster("cluster-1");
	var cluster = clusteringEngine.getCluster("cluster-1");
	assert.ok(cluster == null, "Cluster was successfully deleted.");
});

QUnit.test("Editing cluster works successfully, when new cluster is valid", function(assert) {
	var clusteringEngine = this.clusteringEngine;

	var clusterOptions = sinon.createStubInstance(ClusterOptions);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(true);

	clusteringEngine.cluster(clusterOptions, "cluster-1");

	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(false);
	clusteringEngine.editCluster(clusterOptions, "cluster-1");

	var cluster = clusteringEngine.getCluster("cluster-1");
	assert.ok(cluster != null, "Cluster was successfully created.");
	assert.equal(cluster.getNodes().length, 2, "The edited cluster contains 1 less node, due to different cluster Options");

	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(false);
	clusteringEngine.cluster(clusterOptions, "cluster-2");

	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(true);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("test.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("dummy.com")).returns(true);
	assert.throws(
		function() {
			clusteringEngine.editCluster(clusterOptions, "cluster-1");
		},
		Error,
		"node www.example.com contained in cluster-2"
	);

	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("www.example.com")).returns(false);
	clusterOptions.belongsInCluster.withArgs(this.graph.getNode("another.example.com")).returns(false);
	assert.throws(
		function() {
			clusteringEngine.editCluster(clusterOptions, "cluster-1");
		},
		Error,
		"new cluster contains only 1 node"
	);
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