"use strict";

function GraphStatsCalculator(){
	this.nodeMetricsCalculator = new NodeMetricsCalculator();

	this.totalEdges = 0;
	this.incomingEdges = {
		referral: {
			max: 0,
			min: Number.MAX_SAFE_INTEGER,
			_occ: {},
			M: 0,
			S: 0
		},
		nonReferral: {
			max: 0,
			min: Number.MAX_SAFE_INTEGER,
			_occ: {},
			M: 0,
			S: 0
		},
	};
	this.outgoingEdges = {
		referral: {
			max: 0,
			min: Number.MAX_SAFE_INTEGER,
			_occ: {},
			M: 0,
			S: 0
		},
		nonReferral: {
			max: 0,
			min: Number.MAX_SAFE_INTEGER,
			_occ: {},
			M: 0,
			S: 0
		},
	}

	/* Nodes Statistics */
	this.nodes = {
		firstParty: 0,
		thirdParty: 0,
		total: 0
	};
}

GraphStatsCalculator.prototype.getTotalNodes = function() {
	return this.nodes.firstParty + this.nodes.thirdParty;
}

GraphStatsCalculator.prototype.getNodeMetrics = function(node) {
	return this.nodeMetricsCalculator.getNodeMetrics(node, this.getStatistics());
}

GraphStatsCalculator.prototype.getStatistics = function() {
	return {
		nodeTypes: {
			firstParty: this.nodes.firstParty,
			thirdParty: this.nodes.thirdParty
		},
		totalEdges: this.totalEdges,
		inEdges: {
			referral: {
				avg: this.incomingEdges.referral.M,
				stdDev: this.getStdDevFromS(this.incomingEdges.referral.S, this.nodes.total),
				max: this.incomingEdges.referral.max,
				min: this.incomingEdges.referral.min
			},
			nonReferral: {
				avg: this.incomingEdges.nonReferral.M,
				stdDev: this.getStdDevFromS(this.incomingEdges.nonReferral.S, this.nodes.total),
				max: this.incomingEdges.nonReferral.max,
				min: this.incomingEdges.nonReferral.min
			}
		},
		outEdges: {
			referral: {
				avg: this.outgoingEdges.referral.M,
				stdDev: this.getStdDevFromS(this.outgoingEdges.referral.S, this.nodes.total),
				max: this.outgoingEdges.referral.max,
				min: this.outgoingEdges.referral.min
			},
			nonReferral: {
				avg: this.outgoingEdges.nonReferral.M,
				stdDev: this.getStdDevFromS(this.outgoingEdges.nonReferral.S, this.nodes.total),
				max: this.outgoingEdges.nonReferral.max,
				min: this.outgoingEdges.nonReferral.min
			}
		}
	};
}

GraphStatsCalculator.prototype.updateMinAndMax = function(statsHolder, newValue, previousValue) {
	if(!(newValue in statsHolder._occ)) {
		statsHolder.min = Math.min(statsHolder.min, newValue);
		statsHolder.max = Math.max(statsHolder.max, newValue);
		statsHolder._occ[newValue] = 1;
	}
	else statsHolder._occ[newValue]++;

	statsHolder._occ[previousValue]--;
	if(statsHolder._occ[previousValue] == 0) {
		delete statsHolder._occ[previousValue];
		var val = previousValue;
		if(statsHolder.min == previousValue) {
			while(!(val in statsHolder._occ)) val++;
			statsHolder.min = val;
		}
		if(statsHolder.max == previousValue) {
			while(!(val in statsHolder._occ)) val--;
			statsHolder.max = val;
		}
	}
}

GraphStatsCalculator.prototype.addMember = function(statsHolder, value, sampleSize) {
	var updatedMetrics = this.executeWelfordIteration(statsHolder.M, statsHolder.S, value, sampleSize);
	statsHolder.M = updatedMetrics.new_M;
	statsHolder.S = updatedMetrics.new_S;
}

GraphStatsCalculator.prototype.removeMember = function(statsHolder, value, sampleSize) {
	var updatedMetrics = this.executeReverseWelfordIteration(statsHolder.M, statsHolder.S, value, sampleSize);
	statsHolder.M = updatedMetrics.new_M;
	statsHolder.S = updatedMetrics.new_S;
}

GraphStatsCalculator.prototype.onNewNode = function(node) {
	this.nodes.total++;
	this.updateMinAndMax(this.incomingEdges.referral, 0);
	this.updateMinAndMax(this.incomingEdges.nonReferral, 0);
	this.updateMinAndMax(this.outgoingEdges.referral, 0);
	this.updateMinAndMax(this.outgoingEdges.nonReferral, 0);

	this.addMember(this.incomingEdges.referral, 0, this.nodes.total);
	this.addMember(this.incomingEdges.nonReferral, 0, this.nodes.total);
	this.addMember(this.outgoingEdges.referral, 0, this.nodes.total);
	this.addMember(this.outgoingEdges.nonReferral, 0, this.nodes.total);
}

GraphStatsCalculator.prototype.onNodeChange = function(fromType, toType, node) {
	if(fromType == Node.Type[HttpRequest.Type.ROOT]) this.nodes.firstParty -= 1;
	else if(fromType == Node.Type[HttpRequest.Type.EMBEDDED]) this.nodes.thirdParty -= 1;

	if(toType == Node.Type[HttpRequest.Type.ROOT]) this.nodes.firstParty += 1;
	else if(toType == Node.Type[HttpRequest.Type.EMBEDDED]) this.nodes.thirdParty += 1;
}

GraphStatsCalculator.prototype.onNewEdge = function(edge) {
	var srcOutgoingEdges = edge.getSourceNode().getOutgoingEdgesByType(), dstIncomingEdges = edge.getDestinationNode().getIncomingEdgesByType();
	var srcOutgoingNonReferralEdges = srcOutgoingEdges[Edge.Type.DEFAULT.name].length + srcOutgoingEdges[Edge.Type.REQUEST.name].length + srcOutgoingEdges[Edge.Type.REDIRECT.name].length;
	var dstIncomingNonReferralEdges = dstIncomingEdges[Edge.Type.DEFAULT.name].length + dstIncomingEdges[Edge.Type.REQUEST.name].length + dstIncomingEdges[Edge.Type.REDIRECT.name].length;

	this.totalEdges++;
	//console.log("onNewEdge from: "  + edge.getSourceNode().id + ", to: " + edge.getDestinationNode().id);
	//console.log("dstIncomingNonReferralEdges: "  + dstIncomingNonReferralEdges);
	//console.log(JSON.stringify(this.incomingEdges.nonReferral));
	this.updateMinAndMax(this.incomingEdges.nonReferral, dstIncomingNonReferralEdges, dstIncomingNonReferralEdges-1);
	//console.log(JSON.stringify(this.incomingEdges.nonReferral));
	this.updateMinAndMax(this.outgoingEdges.nonReferral, srcOutgoingNonReferralEdges, srcOutgoingNonReferralEdges-1);

	this.removeMember(this.incomingEdges.nonReferral, dstIncomingNonReferralEdges-1, this.nodes.total);
	this.addMember(this.incomingEdges.nonReferral, dstIncomingNonReferralEdges, this.nodes.total);

	this.removeMember(this.outgoingEdges.nonReferral, srcOutgoingNonReferralEdges-1, this.nodes.total);
	this.addMember(this.outgoingEdges.nonReferral, srcOutgoingNonReferralEdges, this.nodes.total);
}

GraphStatsCalculator.prototype.onEdgeChange = function(fromType, toType, edge) {
	if(fromType != Edge.Type.REFERRAL && toType == Edge.Type.REFERRAL) {
		var srcOutgoingEdges = edge.getSourceNode().getOutgoingEdgesByType(), dstIncomingEdges = edge.getDestinationNode().getIncomingEdgesByType();
		var srcOutgoingReferralEdges = srcOutgoingEdges[Edge.Type.REFERRAL.name].length;
		var srcOutgoingNonReferralEdges = srcOutgoingEdges[Edge.Type.DEFAULT.name].length + srcOutgoingEdges[Edge.Type.REQUEST.name].length + srcOutgoingEdges[Edge.Type.REDIRECT.name].length;
		var dstIncomingReferralEdges = dstIncomingEdges[Edge.Type.REFERRAL.name].length;
		var dstIncomingNonReferralEdges = dstIncomingEdges[Edge.Type.DEFAULT.name].length + dstIncomingEdges[Edge.Type.REQUEST.name].length + dstIncomingEdges[Edge.Type.REDIRECT.name].length;

		//console.log("onEdgeChange from: "  + edge.getSourceNode().id + ", to: " + edge.getDestinationNode().id);
		//console.log("dstIncomingNonReferralEdges: "  + dstIncomingNonReferralEdges);
		//console.log(JSON.stringify(this.incomingEdges.nonReferral));
		this.updateMinAndMax(this.incomingEdges.nonReferral, dstIncomingNonReferralEdges, dstIncomingNonReferralEdges+1);
		//console.log(JSON.stringify(this.incomingEdges.nonReferral));
		this.updateMinAndMax(this.outgoingEdges.nonReferral, srcOutgoingNonReferralEdges, srcOutgoingNonReferralEdges+1);
		this.updateMinAndMax(this.incomingEdges.referral, dstIncomingReferralEdges, dstIncomingReferralEdges-1);
		this.updateMinAndMax(this.outgoingEdges.referral, srcOutgoingReferralEdges, srcOutgoingReferralEdges-1);

		this.removeMember(this.incomingEdges.nonReferral, dstIncomingNonReferralEdges+1, this.nodes.total);
		this.addMember(this.incomingEdges.nonReferral, dstIncomingNonReferralEdges, this.nodes.total);
		this.removeMember(this.outgoingEdges.nonReferral, srcOutgoingNonReferralEdges+1, this.nodes.total);
		this.addMember(this.outgoingEdges.nonReferral, srcOutgoingNonReferralEdges, this.nodes.total);

		this.removeMember(this.incomingEdges.referral, dstIncomingReferralEdges-1, this.nodes.total);
		this.addMember(this.incomingEdges.referral, dstIncomingReferralEdges, this.nodes.total);
		this.removeMember(this.outgoingEdges.referral, srcOutgoingReferralEdges-1, this.nodes.total);
		this.addMember(this.outgoingEdges.referral, srcOutgoingReferralEdges, this.nodes.total);
	}
}

/* Adding a member in the population */
GraphStatsCalculator.prototype.executeWelfordIteration = function(M, S, val, n) {
	if(n == 1) {
		M = val;
		S = 0;
	}
	else {
		var old_M = M;
		M = old_M + (val - old_M)/n;
		S = S + (val - old_M)*(val - M);
	}
	return {new_M: M, new_S: S};
}

/* Removing a member from the population */
GraphStatsCalculator.prototype.executeReverseWelfordIteration = function(M, S, val, n) {
	if(n == 1) {
		M = val;
		S = 0;
	}
	else {
		var last_M = M;
		M = (last_M*n - val)/(n-1);
		S = S - (val - M)*(val - last_M);
	}
	return {new_M: M, new_S: S};
}

GraphStatsCalculator.prototype.getStdDevFromS = function(S, n) {
	var variance = (n > 1) ? (S/n) : 0;
	return Math.sqrt(variance);
}