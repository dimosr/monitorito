QUnit.module( "graph.statistics.NodeMetricsFactory", {
    beforeEach: function() {
        this.mockStatistics = {
            inEdges: {
                referral: {
                    max: 10
                }
            }
        };

        this.phishingMetric = NodeMetricsFactory.getInstance().getMetrics()[0];
        this.trackingMetric = NodeMetricsFactory.getInstance().getMetrics()[1];
        this.leakingMetric = NodeMetricsFactory.getInstance().getMetrics()[2];
        this.trackingCookiesMetric = NodeMetricsFactory.getInstance().getMetrics()[3];
    }
});


QUnit.test("testing Phishing Metric properties", function(assert) {
    var phishingMetric = this.phishingMetric;
    var mockStatistics = this.mockStatistics;

    var stubNode = sinon.createStubInstance(DomainNode);
    stubNode.getOutgoingDomainEdges.returns(new Array(5));
    stubNode.getIncomingDomainEdges.returns(new Array(1));

    var metricValue = phishingMetric.calculate(stubNode, mockStatistics);
    assert.equal(metricValue, (1/7)*100, "Phishing Metric calculated correctly");

    assert.equal(phishingMetric.getCodeName(), "phishing", "Correct codeName assigned");
    assert.equal(phishingMetric.getDisplayName(), "Phishing", "Correct displayName assigned");
    assert.equal(phishingMetric.getMinValue(), 0, "Correct minimum value of metric assigned");
    assert.equal(phishingMetric.getMaxValue(), 100, "Correct maximum value of metric assigned");
});

QUnit.test("testing Leaking Metric properties", function(assert) {
    var leakingMetric = this.leakingMetric;
    var mockStatistics = this.mockStatistics;

    var rootNode = sinon.createStubInstance(DomainNode);

    var neighbourNode1 = sinon.createStubInstance(DomainNode);
    var edges = new Array(2).fill(sinon.createStubInstance(DomainEdge));
    edges.map(function(edge) { edge.getType.returns(DomainEdge.Type.REFERRAL)});
    neighbourNode1.getIncomingDomainEdges.returns(edges);

    var neighbourNode2 = sinon.createStubInstance(DomainNode);
    var edges = new Array(3).fill(sinon.createStubInstance(DomainEdge));
    edges.map(function(edge) { edge.getType.returns(DomainEdge.Type.REFERRAL)});
    neighbourNode2.getIncomingDomainEdges.returns(edges);

    var edge1 = sinon.createStubInstance(DomainEdge);
    edge1.getDestinationNode.returns(neighbourNode1);
    edge1.getType.returns(DomainEdge.Type.REFERRAL);
    var edge2 = sinon.createStubInstance(DomainEdge);
    edge2.getDestinationNode.returns(neighbourNode2);
    edge2.getType.returns(DomainEdge.Type.REFERRAL);
    rootNode.getOutgoingDomainEdges.returns([edge1, edge2]);

    var metricValue = leakingMetric.calculate(rootNode, mockStatistics);
    assert.equal(metricValue, (Math.pow(2/10,2)+Math.pow(3/10,2))/2*100, "Tracking Leaking calculated correctly");

    assert.equal(leakingMetric.getCodeName(), "leaking", "Correct codeName assigned");
    assert.equal(leakingMetric.getDisplayName(), "Leaking", "Correct displayName assigned");
    assert.equal(leakingMetric.getMinValue(), 0, "Correct minimum value of metric assigned");
    assert.equal(leakingMetric.getMaxValue(), 100, "Correct maximum value of metric assigned");
});

QUnit.test("testing Tracking Metric properties", function(assert) {
    var trackingMetric = this.trackingMetric;
    var mockStatistics = this.mockStatistics;

    var rootNode = sinon.createStubInstance(DomainNode);
    var edges = new Array(4).fill(sinon.createStubInstance(DomainEdge));
    edges.map(function(edge) {edge.getType.returns(DomainEdge.Type.REFERRAL)});
    rootNode.getIncomingDomainEdges.returns(edges);

    var metricValue = trackingMetric.calculate(rootNode, mockStatistics);
    assert.equal(metricValue, (4/10)*100, "Tracking Metric calculated correctly");

    assert.equal(trackingMetric.getCodeName(), "tracking", "Correct codeName assigned");
    assert.equal(trackingMetric.getDisplayName(), "Tracking", "Correct displayName assigned");
    assert.equal(trackingMetric.getMinValue(), 0, "Correct minimum value of metric assigned");
    assert.equal(trackingMetric.getMaxValue(), 100, "Correct maximum value of metric assigned");
});

QUnit.test("testing TrackingCookies Metric properties", function(assert) {
    var trackingCookiesMetric = this.trackingCookiesMetric;
    var mockStatistics = this.mockStatistics;

    var node = sinon.createStubInstance(DomainNode);
    var firstPartyCookies = {
        "cookie1": "value1",
        "cookie2": "value2",
        "cookie3": "value3"
    };
    var thirdPartyCookies = {
        "cookie1": "value1",
        "cookie2": "value2",
        "cookie3": "value3",
        "cookie4": "value4",
        "cookie5": "value5"
    };
    node.getFirstPartyCookies.returns(firstPartyCookies);
    node.getThirdPartyCookies.returns(thirdPartyCookies);

    var metricValue = trackingCookiesMetric.calculate(node, mockStatistics);
    assert.equal(metricValue, (5/(5+3))*100, "TrackingCookies Metric calculated correctly");

    assert.equal(trackingCookiesMetric.getCodeName(), "tracking-cookies", "Correct codeName assigned");
    assert.equal(trackingCookiesMetric.getDisplayName(), "Tracking Cookies", "Correct displayName assigned");
    assert.equal(trackingCookiesMetric.getMinValue(), 0, "Correct minimum value of metric assigned");
    assert.equal(trackingCookiesMetric.getMaxValue(), 100, "Correct maximum value of metric assigned");
});