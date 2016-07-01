QUnit.module( "graph.statistics.NodeMetricsCalculator", {
	beforeEach: function() {
		this.nodeMetricsCalculator = new NodeMetricsCalculator();
	}
});

QUnit.test("testing Phishing Metric calculation", function(assert) {
	var nodeMetricsCalculator = this.nodeMetricsCalculator;
	var mockStatistics = {};

	var stubNode = sinon.createStubInstance(DomainNode);
	stubNode.getOutgoingEdges.returns(new Array(5));
	stubNode.getIncomingEdges.returns(new Array(1));

	var phishingMetric = nodeMetricsCalculator.getPhishingMetric(stubNode, mockStatistics);
	assert.equal(phishingMetric, (1/7)*100, "Phishing Metric calculated correctly");
});

QUnit.test("testing Tracking Metric calculation", function(assert) {
	var nodeMetricsCalculator = this.nodeMetricsCalculator;
	var mockStatistics = {
		inEdges: {
			referral: {
				max: 10
			}
		}
	};

	var rootNode = sinon.createStubInstance(DomainNode);
	var edges = [];
	for(var i = 0; i < 4; i++) {
		var edge = sinon.createStubInstance(DomainEdge);
		edge.getType.returns(DomainEdge.Type.REFERRAL);
		edges.push(edge);
	}
	rootNode.getIncomingEdges.returns(edges);

	var trackingMetric = nodeMetricsCalculator.getTrackingMetric(rootNode, mockStatistics);
	assert.equal(trackingMetric, (4/10)*100, "Tracking Metric calculated correctly");
});

QUnit.test("testing Leaking Metric calculation", function(assert) {
	var nodeMetricsCalculator = this.nodeMetricsCalculator;
	var mockStatistics = {
		inEdges: {
			referral: {
				max: 10
			}
		}
	};

	var rootNode = sinon.createStubInstance(DomainNode);
	var neighbourNode1 = sinon.createStubInstance(DomainNode);
	var edges = [];
	for(var i = 0; i < 2; i++) {
		var edge = sinon.createStubInstance(DomainEdge);
		edge.getType.returns(DomainEdge.Type.REFERRAL);
		edges.push(edge);
	}
	neighbourNode1.getIncomingEdges.returns(edges);
	var edge1 = sinon.createStubInstance(DomainEdge);
	edge1.getDestinationNode.returns(neighbourNode1);
	edge1.getType.returns(DomainEdge.Type.REFERRAL);
	var neighbourNode2 = sinon.createStubInstance(DomainNode);
	var edges = [];
	for(var i = 0; i < 3; i++) {
		var edge = sinon.createStubInstance(DomainEdge);
		edge.getType.returns(DomainEdge.Type.REFERRAL);
		edges.push(edge);
	}
	neighbourNode2.getIncomingEdges.returns(edges);
	var edge2 = sinon.createStubInstance(DomainEdge);
	edge2.getDestinationNode.returns(neighbourNode2);
	edge2.getType.returns(DomainEdge.Type.REFERRAL);
	rootNode.getOutgoingEdges.returns([edge1, edge2]);

	var leakingMetric = nodeMetricsCalculator.getLeakingMetric(rootNode, mockStatistics);
	assert.equal(leakingMetric, (Math.pow(2/10,2)+Math.pow(3/10,2))/2*100, "Tracking Leaking calculated correctly");
});