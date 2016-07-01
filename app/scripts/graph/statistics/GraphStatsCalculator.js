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
	if(fromType == DomainNode.Type[HttpRequest.Type.ROOT]) this.nodes.firstParty -= 1;
	else if(fromType == DomainNode.Type[HttpRequest.Type.EMBEDDED]) this.nodes.thirdParty -= 1;

	if(toType == DomainNode.Type[HttpRequest.Type.ROOT]) this.nodes.firstParty += 1;
	else if(toType == DomainNode.Type[HttpRequest.Type.EMBEDDED]) this.nodes.thirdParty += 1;
}

GraphStatsCalculator.prototype.onNewEdge = function(edge) {
	if(edge.getSourceNode() != edge.getDestinationNode()) {//not counting self-referencing edges for statistics
		this.totalEdges++;

		var srcOutgoingEdges = DomainEdge.groupEdgesByType(edge.getSourceNode().getOutgoingEdges(true)), dstIncomingEdges = DomainEdge.groupEdgesByType(edge.getDestinationNode().getIncomingEdges(true));
		var srcOutgoingReferralEdges = srcOutgoingEdges[DomainEdge.Type.REFERRAL.name].length;
		var srcOutgoingNonReferralEdges = srcOutgoingEdges[DomainEdge.Type.DEFAULT.name].length + srcOutgoingEdges[DomainEdge.Type.REQUEST.name].length + srcOutgoingEdges[DomainEdge.Type.REDIRECT.name].length;
		var dstIncomingReferralEdges = dstIncomingEdges[DomainEdge.Type.REFERRAL.name].length;
		var dstIncomingNonReferralEdges = dstIncomingEdges[DomainEdge.Type.DEFAULT.name].length + dstIncomingEdges[DomainEdge.Type.REQUEST.name].length + dstIncomingEdges[DomainEdge.Type.REDIRECT.name].length;

		this.incomingEdges.nonReferral.editMemberValue(dstIncomingNonReferralEdges, dstIncomingNonReferralEdges - 1);
		this.outgoingEdges.nonReferral.editMemberValue(srcOutgoingNonReferralEdges, srcOutgoingNonReferralEdges - 1);
	}
}

GraphStatsCalculator.prototype.onEdgeChange = function(fromType, toType, edge) {
	if(edge.getSourceNode() != edge.getDestinationNode()) {//not counting self-referencing edges for statistics
		/* Only track changes from nonReferral to Referral */
		if(fromType != DomainEdge.Type.REFERRAL && toType == DomainEdge.Type.REFERRAL) {
			var srcOutgoingEdges = DomainEdge.groupEdgesByType(edge.getSourceNode().getOutgoingEdges(true)), dstIncomingEdges = DomainEdge.groupEdgesByType(edge.getDestinationNode().getIncomingEdges(true));
			var srcOutgoingReferralEdges = srcOutgoingEdges[DomainEdge.Type.REFERRAL.name].length;
			var srcOutgoingNonReferralEdges = srcOutgoingEdges[DomainEdge.Type.DEFAULT.name].length + srcOutgoingEdges[DomainEdge.Type.REQUEST.name].length + srcOutgoingEdges[DomainEdge.Type.REDIRECT.name].length;
			var dstIncomingReferralEdges = dstIncomingEdges[DomainEdge.Type.REFERRAL.name].length;
			var dstIncomingNonReferralEdges = dstIncomingEdges[DomainEdge.Type.DEFAULT.name].length + dstIncomingEdges[DomainEdge.Type.REQUEST.name].length + dstIncomingEdges[DomainEdge.Type.REDIRECT.name].length;

			this.incomingEdges.referral.editMemberValue(dstIncomingReferralEdges, dstIncomingReferralEdges-1);
			this.incomingEdges.nonReferral.editMemberValue(dstIncomingNonReferralEdges, dstIncomingNonReferralEdges+1);
			this.outgoingEdges.referral.editMemberValue(srcOutgoingReferralEdges, srcOutgoingReferralEdges-1);
			this.outgoingEdges.nonReferral.editMemberValue(srcOutgoingNonReferralEdges, srcOutgoingNonReferralEdges+1);
		}
	}
}

