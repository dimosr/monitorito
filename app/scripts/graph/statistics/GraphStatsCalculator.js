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

GraphStatsCalculator.prototype.onNewNode = function(node) {
	switch(node.getType()) {
		case HttpRequest.Type.ROOT: 
			this.rootNodes++;
			break;
		case HttpRequest.Type.EMBEDDED: 
			this.embeddedNodes++;
			break;
	}

	if(this.minOutgoingEdges == 0) this._nodesWithMinOutgoingEdges++;
	else {
		this.minOutgoingEdges = 0;
		this._nodesWithMinOutgoingEdges = 1;
	}

	if(this.minIncomingEdges == 0) this._nodesWithMinIncomingEdges++;
	else {
		this.minIncomingEdges = 0;
		this._nodesWithMinIncomingEdges = 1;
	}
}

GraphStatsCalculator.prototype.onNewEdge = function(sourceNode, destinationNode, edge) {
	var outgoingEdges = sourceNode.getOutgoingEdges().length;
	var incomingEdges = destinationNode.getIncomingEdges().length;

	this.totalEdges++;
	if(outgoingEdges > this.maxOutgoingEdges) this.maxOutgoingEdges = outgoingEdges;
	if(incomingEdges > this.maxIncomingEdges) this.maxIncomingEdges = incomingEdges;

	if(outgoingEdges == (this.minOutgoingEdges+1) ) {
		if(this._nodesWithMinOutgoingEdges == 1) this.minOutgoingEdges = outgoingEdges;
		else this._nodesWithMinOutgoingEdges--;
	}
	if(incomingEdges == (this.minIncomingEdges+1) ) {
		if(this._nodesWithMinIncomingEdges == 1) this.minIncomingEdges = incomingEdges;
		else this._nodesWithMinIncomingEdges--;
	}
}