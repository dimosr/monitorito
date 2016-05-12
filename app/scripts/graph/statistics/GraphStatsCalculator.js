"use strict";

function GraphStatsCalculator(){
	this.totalEdges = 0;

	/*Outgoing Edges */
	this.maxOutgoingEdges = 0;
	this.minOutgoingEdges = 0;
	this._nodesWithMinOutgoingEdges = 0;

	this.sumOutgoingEdges = 0;
	this.avgOutgoingEdgesPerNode = 0;

	this._M_outgoing_edges = 0;
	this._S_outgoing_edges = 0;

	/*Incoming Edges */
	this.maxIncomingEdges = 0;
	this.minIncomingEdges = 0;
	this._nodesWithMinIncomingEdges = 0;

	this.sumIncomingEdges = 0;
	this.avgIncomingEdgesPerNode = 0;

	this._M_incoming_edges = 0;
	this._S_incoming_edges = 0;

	/* Nodes Statistics */
	this.embeddedNodes = 0;
	this.rootNodes = 0;
	this.totalNodes = 0;
}

GraphStatsCalculator.prototype.getStatistics = function() {
	return {
		nodeTypes: {
			root: this.rootNodes,
			embedded: this.embeddedNodes
		},
		totalEdges: this.totalEdges,
		inEdges: {
			avg: this.roundDecimal(this.avgIncomingEdgesPerNode),
			stdDev: this.roundDecimal(this.getStdDevFromWelfordMetrics(this._M_incoming_edges, this._S_incoming_edges, this.totalNodes)),
			max: this.maxIncomingEdges,
			min: this.minIncomingEdges
		},
		outEdges: {
			avg: this.roundDecimal(this.avgOutgoingEdgesPerNode),
			stdDev: this.roundDecimal(this.getStdDevFromWelfordMetrics(this._M_outgoing_edges, this._S_outgoing_edges, this.totalNodes)),
			max: this.maxOutgoingEdges,
			min: this.minOutgoingEdges
		}
	}
}

GraphStatsCalculator.prototype.onNewNode = function(node) {
	this.updateNodeTypesRatio(node.getType());
	this.checkNewNodeForMinOutgoingEdges();
	this.checkNewNodeForMinIncomingEdges();

	this.updateStdDevMetrics(0,0);
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
	this.totalNodes++;
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
	var srcOutgoingEdges = sourceNode.getOutgoingEdges().length;
	var dstIncomingEdges = destinationNode.getIncomingEdges().length;
	this.updateMaxMinOutgoingEdges(srcOutgoingEdges);
	this.updateMaxMinIncomingEdges(dstIncomingEdges);
	this.updateAvg();
	this.updateStdDevMetrics(srcOutgoingEdges, dstIncomingEdges);
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

GraphStatsCalculator.prototype.updateAvg = function() {
	this.sumOutgoingEdges++;
	this.sumIncomingEdges++;
	this.avgOutgoingEdgesPerNode = this.sumOutgoingEdges/this.totalNodes;
	this.avgIncomingEdgesPerNode = this.sumIncomingEdges/this.totalNodes;
}

GraphStatsCalculator.prototype.updateStdDevMetrics = function(srcNodeOutgoingEdges, dstNodeIncomingEdges) {
	var updatedMetrics = this.executeDoubleWelfordIteration(this._M_outgoing_edges, this._S_outgoing_edges, srcNodeOutgoingEdges, this.totalNodes);
	this._M_outgoing_edges = updatedMetrics.new_M;
	this._S_outgoing_edges = updatedMetrics.new_S;

	var updatedMetrics = this.executeDoubleWelfordIteration(this._M_incoming_edges, this._S_incoming_edges, dstNodeIncomingEdges, this.totalNodes);
	this._M_incoming_edges = updatedMetrics.new_M;
	this._S_incoming_edges = updatedMetrics.new_S;
}

GraphStatsCalculator.prototype.executeDoubleWelfordIteration = function(M, S, val, n) {
	if(n == 1) {
		M = val;
		S = 0;
	}
	else {
		if(val > 0) {
			var last_M = M;
			var old_val = val-1;
			M = (last_M*n - old_val)/(n-1);
			S = S - (old_val - M)*(old_val - last_M);
		}

		var old_M = M;
		M = old_M + (val - old_M)/n;
		S = S + (val - old_M)*(val - M);
	}

	return {new_M: M, new_S: S};
}

GraphStatsCalculator.prototype.getStdDevFromWelfordMetrics = function(M, S, n) {
	var variance = (n > 1) ? (S/n) : 0;
	return Math.sqrt(variance);
}

GraphStatsCalculator.prototype.roundDecimal = function(number) {
	return Math.round(number * 1000) / 1000;
}

GraphStatsCalculator.prototype.getPhishingMetric = function(node) {
	var outEdges = node.getOutgoingEdges().length; 
	var inEdges = node.getIncomingEdges().length;
	return (1/(1+inEdges+outEdges))*100;
}

GraphStatsCalculator.prototype.getTrackingMetric = function(node) {
	var inEdges = node.getIncomingEdges().length;
	return (inEdges/this.maxIncomingEdges)*100;
}

GraphStatsCalculator.prototype.getLeakingMetric = function(node) {
	var outEdges = node.getOutgoingEdges();
	var sum = 0;
	for(var i = 0; i < outEdges.length; i++) {
		var neighbourIncomingEdges = outEdges[i].getDestinationNode().getIncomingEdges().length;
		sum += Math.pow(neighbourIncomingEdges / this.maxIncomingEdges,2)
	}
	sum = (sum/outEdges.length)*100;
	return sum;
}