QUnit.module( "graph.vis.VisualisationNetwork", {
    beforeEach: function() {
        this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
        this.mockNetwork = sinon.mock(this.visualisationNetwork);
        this.visualisationNetwork.setupListeners(sinon.createStubInstance(Graph));
    }
});

QUnit.test("Testing addListeners() method, checking if assigned callback function is called properly", function(assert) {
    var visualisationNetwork = this.visualisationNetwork;
    var selectNodeCallback = sinon.spy(), selectEdgeCallback = sinon.spy(), deselectNodeCallback = sinon.spy(), deselectEdgeCallback = sinon.spy();

    var node = sinon.createStubInstance(DomainNode);
    var edge = sinon.createStubInstance(DomainEdge);

    visualisationNetwork.triggerSelectNode(node);
    sinon.assert.notCalled(selectNodeCallback);
    visualisationNetwork.triggerDeselectNode(node);
    sinon.assert.notCalled(deselectNodeCallback);
    visualisationNetwork.triggerSelectEdge(edge);
    sinon.assert.notCalled(selectEdgeCallback);
    visualisationNetwork.triggerDeselectEdge(edge);
    sinon.assert.notCalled(deselectEdgeCallback);

    visualisationNetwork.addListeners(selectNodeCallback, selectEdgeCallback, deselectNodeCallback, deselectEdgeCallback);

    visualisationNetwork.triggerSelectNode(node);
    sinon.assert.calledOnce(selectNodeCallback);
    visualisationNetwork.triggerDeselectNode(node);
    sinon.assert.calledOnce(selectNodeCallback);
    visualisationNetwork.triggerSelectEdge(edge);
    sinon.assert.calledOnce(selectEdgeCallback);
    visualisationNetwork.triggerDeselectEdge(edge);
    sinon.assert.calledOnce(deselectEdgeCallback);
});