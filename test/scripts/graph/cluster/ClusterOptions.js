QUnit.module( "graph.cluster.ClusterOptions", {
    beforeEach: function() {
        this.node1 = sinon.createStubInstance(DomainNode);
        this.node1.getDomain.returns("example.com");
        this.node2 = sinon.createStubInstance(DomainNode);
        this.node2.getDomain.returns("test.com");
        this.node3 = sinon.createStubInstance(DomainNode);
        this.node3.getDomain.returns("example.co.uk");
    }
});

QUnit.test("ClusterOptions using array of domains", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["example.com"]);

    assert.ok(clusterOptions.belongsInCluster(this.node1), "example.com is a domain or sub-domain of example.com");
    assert.notOk(clusterOptions.belongsInCluster(this.node2), "test.com is not a domain or sub-domain of example.com");
    assert.notOk(clusterOptions.belongsInCluster(this.node3), "example.co.uk is not a domain or sub-domain of example.com");
});

QUnit.test("ClusterOptions using user-defined Regular Expression", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.REGEXP);
    clusterOptions.setRegExp(new RegExp("(.*)example(.*)"));

    assert.ok(clusterOptions.belongsInCluster(this.node1), "example.com matches regular expression '(.*)example(.*)'");
    assert.notOk(clusterOptions.belongsInCluster(this.node2), "test.com does not match regular expression '(.*)example(.*)'");
    assert.ok(clusterOptions.belongsInCluster(this.node3), "example.co.uk matches regular expression '(.*)example(.*)'");
});

QUnit.test("Must provide operationType to initialise ClusterOptions", function(assert) {
    assert.throws(
        function() {
            var clusterOptions = new ClusterOptions();
        },
        Error,
        "cannot initialise ClusterOptions without operationType"
    );
});

QUnit.test("Array of domains or Regular Expression must be provided as parameter", function(assert) {
    assert.throws(
        function() {
            var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
            clusterOptions.setDomains("test.com");
        },
        Error,
        "If operationType is DOMAINS, then provided parameter should be array of domain"
    );

    assert.throws(
        function() {
            var clusterOptions = new ClusterOptions(ClusterOptions.operationType.REGEXP);
            clusterOptions.setRegExp("test.com");
        },
        Error,
        "If operationType is REGEXP, then provided parameter should be a regular Expression"
    );
});

QUnit.test("Clustering is only applicable to Domain Nodes", function(assert) {
    assert.throws(
        function() {
            var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
            clusterOptions.setDomains(["test.com"]);
            var node = sinon.createStubInstance(ResourceNode);
            clusterOptions.belongsInCluster(node);
        },
        Error,
        "If operationType is REGEXP, then provided parameter should be a regular Expression"
    );
});