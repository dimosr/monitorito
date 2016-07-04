"use strict";

function VisualisationNetwork(domElement, nodesDataset, edgesDataset) {
    var options = {
        edges: {
            smooth: false
        },
        interaction: {
            tooltipDelay: 0,
            navigationButtons: true
        },
        physics: {
            barnesHut: {
                gravitationalConstant: -14000,
                centralGravity: 0.1,
                springLength: 400,
                springConstant: 0.1,
                avoidOverlap: 0.5
            },
            solver: "barnesHut"
        }
    };
    var data = {
        nodes: (nodesDataset === undefined) ? new vis.DataSet([]) : nodesDataset,
        edges: (edgesDataset === undefined) ? new vis.DataSet([]) : edgesDataset
    };

    this._network = new vis.Network(domElement, data, options);
}

VisualisationNetwork.prototype.disablePhysics = function() {
    this._network.setOptions({physics: {enabled: false}});
}

VisualisationNetwork.prototype.enablePhysics = function() {
    this._network.setOptions({physics: {enabled: true}});
}

VisualisationNetwork.prototype.setupListeners = function(graph) {
    this._network._selectEdgeCallback = function(selectedEdge){};
    this._network._selectNodeCallback = function(selectedNode){};
    this._network._deselectEdgeCallback = function(deselectedEdge){};
    this._network._deselectNodeCallback = function(deselectedNode){};

    this._network.on("select", function(eventParams) {
        if(eventParams.nodes.length == 1) {//Node Selected
            var nodeID = eventParams.nodes[0];
            if(graph.existsNode(nodeID)) {
                var selectedNode = graph.getNode(nodeID);
                this._selectNodeCallback(selectedNode);
            }
            else if(graph.clusteringEngine.getCluster(nodeID) != null) {
                var selectedCluster = graph.clusteringEngine.getCluster(nodeID);
                this._selectNodeCallback(selectedCluster);
            }
        }
        else if(eventParams.nodes.length == 0 && eventParams.edges.length == 1 && (graph.getEdge(eventParams.edges[0]) != null)) {//Edge selected (except clusterEdge, or ResourceNode parentEdge)
            var selectedEdge = graph.getEdge(eventParams.edges[0]);
            this._selectEdgeCallback(selectedEdge);
        }
    });

    this._network.on("deselectNode", function(eventParams) {
        var previousSelection = eventParams.previousSelection;
        if(previousSelection.nodes.length == 1) {//Only in node deselections
            var nodeID = previousSelection.nodes[0];
            if(graph.existsNode(nodeID)) {
                var deselectedNode = graph.getNode(nodeID);
                this._deselectNodeCallback(deselectedNode);
            }
            else if(graph.clusteringEngine.getCluster(nodeID) != null) {
                var deselectedCluster = graph.clusteringEngine.getCluster(nodeID);
                this._deselectNodeCallback(deselectedCluster);
            }
        }
    });

    this._network.on("deselectEdge", function(eventParams) {
        var previousSelection = eventParams.previousSelection;
        if(previousSelection.nodes.length == 0 && previousSelection.edges.length == 1 && (graph.getEdge(previousSelection.edges[0]) != null)) {//Edge deselected (except clusterEdge, or ResourceNode parentEdge)
            var deselectedEdges = previousSelection.edges;
            this._deselectEdgeCallback(deselectedEdges);
        }
    });
}

VisualisationNetwork.prototype.addListeners = function(selectNodeFn, selectEdgeFn, deselectNodeFn, deselectEdgeFn) {
    this._network._selectNodeCallback = selectNodeFn;
    this._network._selectEdgeCallback = selectEdgeFn;
    this._network._deselectNodeCallback = deselectNodeFn;
    this._network._deselectEdgeCallback = deselectEdgeFn;
}

VisualisationNetwork.prototype.getNodesDataset = function() {
    return this._network.body.data.nodes;
}

VisualisationNetwork.prototype.getEdgesDataset = function() {
    return this._network.body.data.edges;
}

VisualisationNetwork.prototype.createCluster = function(options) {
    this._network.cluster(options);
}

VisualisationNetwork.prototype.openCluster = function(clusterID) {
    this._network.openCluster(clusterID);
}

VisualisationNetwork.prototype.triggerSelectNode = function(node) {
    this._network._selectNodeCallback(node);
}

VisualisationNetwork.prototype.triggerDeselectNode = function(nodes) {
    this._network._deselectNodeCallback(nodes);
}


VisualisationNetwork.prototype.triggerSelectEdge = function(edge) {
    this._network._selectEdgeCallback(edge);
}

VisualisationNetwork.prototype.triggerDeselectEdge = function(edge) {
    this._network._deselectEdgeCallback(edge);
}