"use strict";

/* For reference of the widget structure, check InterfaceHandler.initEdgeWidgetHandler */
function EdgeWidgetHandler(controller, widget, screenDimensions) {
	this.widget = widget;
	this.screenDimensions = screenDimensions;
	this.selectedEdge = null;

	this.init();
}

EdgeWidgetHandler.prototype.init = function() {
	var dialogOptions = {
		autoOpen: false,
		modal: true,
		width: this.screenDimensions.width*0.9,
		height: this.screenDimensions.height*0.6
	};

	this.widget.requests.$dialogContent.dialog(dialogOptions);
	this.widget.redirects.$dialogContent.dialog(dialogOptions);
	this.widget.referrals.$dialogContent.dialog(dialogOptions);

	this.widget.requests.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.widget;
		if(!widget.requests.loaded) {
			handler.loadEdgeRequests(handler.selectedEdge);
			widget.requests.loaded = true;
		}
		widget.requests.$dialogContent.dialog( "open" );
	});
	this.widget.redirects.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.widget;
		if(!widget.redirects.loaded) {
			handler.loadEdgeRedirects(handler.selectedEdge);
			widget.redirects.loaded = true;
		}
		widget.redirects.$dialogContent.dialog( "open" );
	});

	this.widget.referrals.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.widget;
		if(!widget.referrals.loaded) {
			handler.loadEdgeReferrals(handler.selectedEdge);
			widget.referrals.loaded = true;
		}
		widget.referrals.$dialogContent.dialog( "open" );
	});
}

EdgeWidgetHandler.prototype.setupOpener = function() {

}

EdgeWidgetHandler.prototype.showInfo = function(edge) {
	var fromNode = edge.getSourceNode();
	var toNode = edge.getDestinationNode();

	this.widget.$typeField.html(edge.getType().name);
	this.widget.$from.html(fromNode.getDomain());
	this.widget.$to.html(toNode.getDomain());
	this.widget.requests.$numberField.html(edge.getLinks(DomainEdge.Type.REQUEST).length);
	this.widget.redirects.$numberField.html(edge.getLinks(DomainEdge.Type.REDIRECT).length);
	this.widget.referrals.$numberField.html(edge.getLinks(DomainEdge.Type.REFERRAL).length);
	this.selectedEdge = edge;

	this.widget.$container.show();
}
EdgeWidgetHandler.prototype.loadEdgeRequests = function(edge) {
	var requests = edge.getLinks(DomainEdge.Type.REQUEST);

	var contentToAdd = '';
	for(var i=0; i < requests.length; i++) {
		var httpRequest = requests[i].link;
		var fromCol = "<td>" + requests[i].from + "</td>";
		var toUrlCol = "<td>" + httpRequest.url + "</td>";
		var toResourceCol = "<td>" + httpRequest.resourceType + "</td>";
		var toMethodCol = "<td>" + httpRequest.method + "</td>";
		contentToAdd += "<tr>" + fromCol + toUrlCol + toResourceCol + toMethodCol + "</tr>";
	}
	this.widget.requests.$dialogTableBody.append(contentToAdd);
}
EdgeWidgetHandler.prototype.loadEdgeRedirects = function(edge) {
	var redirects = edge.getLinks(DomainEdge.Type.REDIRECT);

	var contentToAdd = '';
	for(var i=0; i < redirects.length; i++) {
		var redirect = redirects[i].link;
		var fromCol = "<td>" + redirect.getInitialURL() + "</td>";
		var toCol = "<td>" + redirect.getFinalURL() + "</td>";
		contentToAdd += "<tr>" + fromCol + toCol + "</tr>";
	}
	this.widget.redirects.$dialogTableBody.append(contentToAdd);
}

EdgeWidgetHandler.prototype.loadEdgeReferrals = function(edge) {
	var referrals = edge.getLinks(DomainEdge.Type.REFERRAL);

	var contentToAdd = '';
	for(var i=0; i < referrals.length; i++) {
		var httpRequest = referrals[i].link;
		var fromCol = "<td>" + referrals[i].from + "</td>";
		var toUrlCol = "<td>" + httpRequest.url + "</td>";
		var toResourceCol = "<td>" + httpRequest.resourceType + "</td>";
		var toMethodCol = "<td>" + httpRequest.method + "</td>";
		contentToAdd += "<tr>" + fromCol + toUrlCol + toResourceCol + toMethodCol + "</tr>";
	}
	this.widget.referrals.$dialogTableBody.append(contentToAdd);
}

EdgeWidgetHandler.prototype.emptyInfo = function() {
	this.widget.$container.hide();
	this.widget.requests.loaded = false;
	this.widget.redirects.loaded = false;
	this.widget.referrals.loaded = false;
	this.widget.requests.$dialogTableBody.empty();
	this.widget.redirects.$dialogTableBody.empty();
	this.widget.referrals.$dialogTableBody.empty();
	this.selectedEdge = null;
}