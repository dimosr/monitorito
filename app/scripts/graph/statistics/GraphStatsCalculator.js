"use strict";

function GraphStatsCalculator(){
	this.nodeMetricsCalculator = new NodeMetricsCalculator();

	this.totalEdges = 0;
	this.incomingEdges = {
		referral: new StatisticsHolder(),
		nonReferral: new StatisticsHolder(),
	};
	this.outgoingEdges = {
		referral: new StatisticsHolder(),
		nonReferral: new StatisticsHolder(),
	}

	/* Nodes Statistics */
	this.nodes = {
		firstParty: 0,
		thirdParty: 0,
		total: 0
	};
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
			referral: this.incomingEdges.referral.getStatistics(this.nodes.total),
			nonReferral: this.incomingEdges.nonReferral.getStatistics(this.nodes.total)
		},
		outEdges: {
			referral: this.outgoingEdges.referral.getStatistics(this.nodes.total),
			nonReferral: this.outgoingEdges.nonReferral.getStatistics(this.nodes.total)
		}
	};
}

GraphStatsCalculator.prototype.onNewNode = function(node) {
	this.nodes.total++;

	/* Added node has no edges initially */
	this.incomingEdges.referral.addMember(0);
	this.incomingEdges.nonReferral.addMember(0);
	this.outgoingEdges.referral.addMember(0);
	this.outgoingEdges.nonReferral.addMember(0);
}

GraphStatsCalculator.prototype.onNodeChange = function(fromType, toType, node) {
	if(fromType == Node.Type[HttpRequest.Type.ROOT]) this.nodes.firstParty -= 1;
	else if(fromType == Node.Type[HttpRequest.Type.EMBEDDED]) this.nodes.thirdParty -= 1;

	if(toType == Node.Type[HttpRequest.Type.ROOT]) this.nodes.firstParty += 1;
	else if(toType == Node.Type[HttpRequest.Type.EMBEDDED]) this.nodes.thirdParty += 1;
}

GraphStatsCalculator.prototype.onNewEdge = function(edge) {
	if(edge.getSourceNode() != edge.getDestinationNode()) {//not counting self-referencing edges for statistics
		this.totalEdges++;

		var srcOutgoingEdges = Edge.groupEdgesByType(edge.getSourceNode().getOutgoingEdges(true)), dstIncomingEdges = Edge.groupEdgesByType(edge.getDestinationNode().getIncomingEdges(true));
		var srcOutgoingReferralEdges = srcOutgoingEdges[Edge.Type.REFERRAL.name].length;
		var srcOutgoingNonReferralEdges = srcOutgoingEdges[Edge.Type.DEFAULT.name].length + srcOutgoingEdges[Edge.Type.REQUEST.name].length + srcOutgoingEdges[Edge.Type.REDIRECT.name].length;
		var dstIncomingReferralEdges = dstIncomingEdges[Edge.Type.REFERRAL.name].length;
		var dstIncomingNonReferralEdges = dstIncomingEdges[Edge.Type.DEFAULT.name].length + dstIncomingEdges[Edge.Type.REQUEST.name].length + dstIncomingEdges[Edge.Type.REDIRECT.name].length;

		this.incomingEdges.nonReferral.editMemberValue(dstIncomingNonReferralEdges, dstIncomingNonReferralEdges - 1);
		this.outgoingEdges.nonReferral.editMemberValue(srcOutgoingNonReferralEdges, srcOutgoingNonReferralEdges - 1);
	}
}

GraphStatsCalculator.prototype.onEdgeChange = function(fromType, toType, edge) {
	if(edge.getSourceNode() != edge.getDestinationNode()) {//not counting self-referencing edges for statistics
		/* Only track changes from nonReferral to Referral */
		if(fromType != Edge.Type.REFERRAL && toType == Edge.Type.REFERRAL) {
			var srcOutgoingEdges = Edge.groupEdgesByType(edge.getSourceNode().getOutgoingEdges(true)), dstIncomingEdges = Edge.groupEdgesByType(edge.getDestinationNode().getIncomingEdges(true));
			var srcOutgoingReferralEdges = srcOutgoingEdges[Edge.Type.REFERRAL.name].length;
			var srcOutgoingNonReferralEdges = srcOutgoingEdges[Edge.Type.DEFAULT.name].length + srcOutgoingEdges[Edge.Type.REQUEST.name].length + srcOutgoingEdges[Edge.Type.REDIRECT.name].length;
			var dstIncomingReferralEdges = dstIncomingEdges[Edge.Type.REFERRAL.name].length;
			var dstIncomingNonReferralEdges = dstIncomingEdges[Edge.Type.DEFAULT.name].length + dstIncomingEdges[Edge.Type.REQUEST.name].length + dstIncomingEdges[Edge.Type.REDIRECT.name].length;

			this.incomingEdges.referral.editMemberValue(dstIncomingReferralEdges, dstIncomingReferralEdges-1);
			this.incomingEdges.nonReferral.editMemberValue(dstIncomingNonReferralEdges, dstIncomingNonReferralEdges+1);
			this.outgoingEdges.referral.editMemberValue(srcOutgoingReferralEdges, srcOutgoingReferralEdges-1);
			this.outgoingEdges.nonReferral.editMemberValue(srcOutgoingNonReferralEdges, srcOutgoingNonReferralEdges+1);
		}
	}
}

