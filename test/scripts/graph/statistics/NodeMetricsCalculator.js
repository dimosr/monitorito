QUnit.module( "graph.statistics.NodeMetricsCalculator", {
	beforeEach: function() {
		this.nodeMetricsCalculator = new NodeMetricsCalculator();

	}
});

QUnit.test("Retrieves all metrics from NodeMetricsFactory and calculates them", function(assert) {
	var metrics = NodeMetricsFactory.getInstance().getMetrics();
	var mockMetrics = [];
	var randomValues = [];

	metrics.forEach(function(metric) {
		mockMetrics.push(sinon.mock(metric));
	});
	mockMetrics.forEach(function(mockMetric) {
		var randomNumber = Math.random();
		randomValues.push(randomNumber);
		mockMetric.expects("calculate").exactly(1).returns(randomNumber);
	});

	var calculatedValues = this.nodeMetricsCalculator.getNodeMetrics(sinon.createStubInstance(DomainNode), {});

	metrics.forEach(function(metric, idx) {
		mockMetrics[idx].verify();
		assert.equal(calculatedValues[metric.getCodeName()], randomValues[idx], "Calculated value of metric " + metric.getDisplayName() + " returned successfully")
	});
});