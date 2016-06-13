QUnit.module( "graph.statistics.NodeMetricsCalculator", {
	beforeEach: function() {
		this.nodeMetricsCalculator = new NodeMetricsCalculator();
	}
});

QUnit.test("testing Phishing Metric calculation", function(assert) {
	var nodeMetricsCalculator = this.nodeMetricsCalculator;
	var mockStatistics = {};

	var stubNode = sinon.createStubInstance(Node);
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

	var stubNode = sinon.createStubInstance(Node);
	var edgesByTypeResult = {};
	edgesByTypeResult[Edge.Type.REFERRAL.name] = new Array(4);
	stubNode.getIncomingEdgesByType.returns(edgesByTypeResult);

	var trackingMetric = nodeMetricsCalculator.getTrackingMetric(stubNode, mockStatistics);
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



	var stubNode = sinon.createStubInstance(Node);
	var neighbourNode1 = sinon.createStubInstance(Node);
	var edgesByTypeResult = {};
	edgesByTypeResult[Edge.Type.REFERRAL.name] = new Array(2);
	neighbourNode1.getIncomingEdgesByType.returns(edgesByTypeResult);
	var edge1 = sinon.createStubInstance(Edge);
	edge1.getDestinationNode.returns(neighbourNode1);
	var neighbourNode2 = sinon.createStubInstance(Node);
	var edgesByTypeResult = {};
	edgesByTypeResult[Edge.Type.REFERRAL.name] = new Array(3);
	neighbourNode2.getIncomingEdgesByType.returns(edgesByTypeResult);
	var edge2 = sinon.createStubInstance(Edge);
	edge2.getDestinationNode.returns(neighbourNode2);
	var edgesByTypeResult = {};
	edgesByTypeResult[Edge.Type.REFERRAL.name] = [edge1, edge2];
	stubNode.getOutgoingEdgesByType.returns(edgesByTypeResult);

	var leakingMetric = nodeMetricsCalculator.getLeakingMetric(stubNode, mockStatistics);
	assert.equal(leakingMetric, (Math.pow(2/10,2)+Math.pow(3/10,2))/2*100, "Tracking Leaking calculated correctly");
});