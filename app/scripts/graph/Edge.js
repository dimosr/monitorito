"use strict";

function Edge() {}

Edge.Type = {
	REQUEST: {
		name: "Request Edge", 
		color: 'grey', 
		width: 4, 
		dashes: false,
		arrows: {to: true, from: false}
	},
	REFERRAL: {
		name: "Referrer Edge", 
		color: 'red', 
		width: 4, 
		dashes: false,
		arrows: {to: true, from: false}
	},
	REDIRECT: {
		name: "Redirect Edge", 
		color: 'grey', 
		width: 2, 
		dashes: true,
		arrows: {to: true, from: false}
	},
	DOMAIN: {
		name: "Belongs (to domain) Edge", 
		color: 'blue', 
		width: 3, 
		dashes: true,
		arrows: {to: true, from: true}
	}
}

Edge.getVisSettings = function(fromNode, toNode, edgeType, edgeID){
	return {
		id: edgeID,
		arrows: edgeType.arrows,
		from: fromNode.getID(),
		to: toNode.getID(),
		color: edgeType.color,
		width: edgeType.width,
		dashes: edgeType.dashes
	}
}