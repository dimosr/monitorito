"use strict";

function GraphStatsCalculator(){
	/* Edges Statistics */
	this.totalEdges = 0;

	this.maxOutgoingEdges = 0;
	this.minOutgoingEdges = 0;
	this._nodesWithMinOutgoingEdges = 0;

	this.maxIncomingEdges = 0;
	this.minIncomingEdges = 0;
	this._nodesWithMinIncomingEdges = 0;

	/* Nodes Statistics */
	this.embeddedNodes = 0;
	this.rootNodes = 0;
}

GraphStatsCalculator.prototype.getStatistics = function() {
	return {
		nodeTypes: {
			root: this.rootNodes,
			embedded: this.embeddedNodes
		},
		totalEdges: this.totalEdges,
		inEdges: {
			max: this.maxIncomingEdges,
			min: this.minIncomingEdges
		},
		outEdges: {
			max: this.maxOutgoingEdges,
			min: this.minOutgoingEdges
		}
	}
}

GraphStatsCalculator.prototype.onNewNode = function(node) {
	this.updateNodeTypesRatio(node.getType());
	this.checkNewNodeForMinOutgoingEdges();
	this.checkNewNodeForMinIncomingEdges();
}

GraphStatsCalculator.prototype.updateNodeTypesRatio = function(nodeType) {
	switch(nodeType) {
		case HttpRequest.Type.ROOT: 
			this.rootNodes++;
			break;
		case HttpRequest.Type.EMBEDDED: 
			this.embeddedNodes++;
			break;
	}
}

GraphStatsCalculator.prototype.checkNewNodeForMinOutgoingEdges = function() {
	if(this.minOutgoingEdges == 0) this._nodesWithMinOutgoingEdges++;
	else {
		this.minOutgoingEdges = 0;
		this._nodesWithMinOutgoingEdges = 1;
	}
}

GraphStatsCalculator.prototype.checkNewNodeForMinIncomingEdges = function() {
	if(this.minIncomingEdges == 0) this._nodesWithMinIncomingEdges++;
	else {
		this.minIncomingEdges = 0;
		this._nodesWithMinIncomingEdges = 1;
	}
}


GraphStatsCalculator.prototype.onNewEdge = function(sourceNode, destinationNode, edge) {
	this.totalEdges++;
	this.updateMaxMinOutgoingEdges(sourceNode.getOutgoingEdges().length);
	this.updateMaxMinIncomingEdges(destinationNode.getIncomingEdges().length);	
}

GraphStatsCalculator.prototype.updateMaxMinOutgoingEdges = function(nodeOutgoingEdges) {
	if(nodeOutgoingEdges > this.maxOutgoingEdges) this.maxOutgoingEdges = nodeOutgoingEdges;
	if(nodeOutgoingEdges == (this.minOutgoingEdges+1) ) {
		if(this._nodesWithMinOutgoingEdges == 1) this.minOutgoingEdges = nodeOutgoingEdges;
		else this._nodesWithMinOutgoingEdges--;
	}
}

GraphStatsCalculator.prototype.updateMaxMinIncomingEdges = function(nodeIncomingEdges) {
	if(nodeIncomingEdges > this.maxIncomingEdges) this.maxIncomingEdges = nodeIncomingEdges;
	if(nodeIncomingEdges == (this.minIncomingEdges+1) ) {
		if(this._nodesWithMinIncomingEdges == 1) this.minIncomingEdges = nodeIncomingEdges;
		else this._nodesWithMinIncomingEdges--;
	}
}