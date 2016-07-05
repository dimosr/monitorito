"use strict";

/* For reference of the widget structure, check InterfaceHandler.initNodeWidgetHandler */
function NodeWidgetHandler(controller, widget, screenDimensions) {
	this.controller = controller;
	this.widget = widget;
	this.selectedNode = null;

	this.screenDimensions = screenDimensions;
	this.init();
}

NodeWidgetHandler.prototype.init = function() {
	var dialogOptions = {
		autoOpen: false,
		modal: true,
		width: this.screenDimensions.width*0.9,
		height: this.screenDimensions.height*0.6
	};
	this.widget.requests.$dialogContent.dialog(dialogOptions);
	this.widget.firstPartyCookies.$dialogContent.dialog(dialogOptions);
	this.widget.thirdPartyCookies.$dialogContent.dialog(dialogOptions);


	this.widget.requests.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.widget;
		if(!widget.requests.loaded) {
			handler.loadNodeRequests(handler.selectedNode);
			widget.requests.loaded = true;
		}
		widget.requests.$dialogContent.dialog( "open" );
	});
	this.widget.firstPartyCookies.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.widget;
		if(!widget.firstPartyCookies.loaded) {
			handler.loadFirstPartyCookies(handler.selectedNode);
			widget.firstPartyCookies.loaded = true;
		}
		widget.firstPartyCookies.$dialogContent.dialog( "open" );
	});
	this.widget.thirdPartyCookies.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.widget;
		if(!widget.thirdPartyCookies.loaded) {
			handler.loadThirdPartyCookies(handler.selectedNode);
			widget.thirdPartyCookies.loaded = true;
		}
		widget.thirdPartyCookies.$dialogContent.dialog( "open" );
	});

	this.widget.$expandButton.click({handler: this}, function(event) {
		var handler = event.data.handler;
		try {
			handler.controller.expandDomainNode(handler.selectedNode.getID());
			handler.widget.$expandButton.addClass("disabled");
			handler.widget.$collapseButton.removeClass("disabled");
		}
		catch(err) {
			$.alert(err.message, "Clustering Error");
		}
	});
	this.widget.$collapseButton.click({handler: this}, function(event) {
		var handler = event.data.handler;
		try {
			handler.controller.collapseDomainNode(handler.selectedNode.getID());
			handler.widget.$expandButton.removeClass("disabled");
			handler.widget.$collapseButton.addClass("disabled");
		}
		catch(err) {
			$.alert(err.message, "Clustering Error");
		}
	});
}

NodeWidgetHandler.prototype.showInfo = function(node) {
	this.widget.$domainField.html(node.getID());
	this.widget.requests.$numberField.html(node.getRequests().length);
	this.widget.firstPartyCookies.$numberField.html(Object.keys(node.getFirstPartyCookies()).length);
	this.widget.thirdPartyCookies.$numberField.html(Object.keys(node.getThirdPartyCookies()).length);
	if(node instanceof DomainNode) {
		this.widget.$explorerPanel.show();
		if(node.isExpanded()) {
			this.widget.$expandButton.addClass("disabled");
			this.widget.$collapseButton.removeClass("disabled");
		}
		else {
			this.widget.$expandButton.removeClass("disabled");
			this.widget.$collapseButton.addClass("disabled");
		}
	}
	else if(node instanceof ResourceNode) {
		this.widget.$explorerPanel.hide();
	}

	this.selectedNode = node;
	this.widget.$container.show();
}

NodeWidgetHandler.prototype.loadNodeRequests = function(node) {
	var requests = node.getRequests();

	var requestsRows = "";
	for(var i=0; i < requests.length; i++) {
		var request = requests[i];
		var typeColumn = "<td>" + request.type + "</td>";
		var resourceColumn = "<td>" + request.resourceType + "</td>";
		var methodColumn = "<td>" + request.method + "</td>";
		var urlColumn = "<td>" + request.url + "</td>";
		var refererColumn = "<td>" + request.getReferer() + "</td>";
		var parametersContent = "";
		if(request.method == "POST") {
			var bodyParams = request.bodyParams;
			var paramKeys = Object.keys(bodyParams);
			for(var keyIdx = 0; keyIdx < paramKeys.length; keyIdx++) {
				var key = paramKeys[keyIdx];
				var paramValues = "";
				for(var j = 0; j < bodyParams[key].length; j++) {
					var paramValue = "<li>" + Util.escapeHtml(bodyParams[key][j]) + "</li>";
					paramValues += paramValue;
				}
				paramValues = "<ul title='Values of parameter " + key + "' class='param_values wrap'>" + paramValues + "</ul>";
				parametersContent += "<li class='param_key'>" + key + paramValues + "</li>";
			}
		}
		var bodyColumn = "<td><ul>" + parametersContent + "</ul></td>";
		requestsRows += "<tr>" + typeColumn + resourceColumn + methodColumn + urlColumn + refererColumn + bodyColumn + "</tr>";
	}
	this.widget.requests.$dialogTableBody.append(requestsRows);
	this.enablePostParamsDialog();
}

NodeWidgetHandler.prototype.enablePostParamsDialog = function() {
	var screenDimensions = this.screenDimensions;
	$('.param_key').each(function() {  
		$.data(this, 'dialog', 
			$(this).children('.param_values').dialog({
				autoOpen: false,
				show: {
					effect: "bounce",
					duration: 300
				},
				hide: {
					effect: "scale",
					duration: 300
				},
				modal: true,
				width: screenDimensions.width*0.3,
				height: screenDimensions.height*0.3,
				stack: true
			})
		);  
	}).click(function() {
		$.data(this, 'dialog').dialog('open');
		return false;  
	});
}

NodeWidgetHandler.prototype.loadFirstPartyCookies = function(node) {
	var cookies = node.getFirstPartyCookies();
	var contentToAdd = '';
	for(var key in cookies) {
		var keyCol = "<td>" + key + "</td>";
		var valueCol = "<td>" + cookies[key] + "</td>";
		contentToAdd += "<tr>" + keyCol + valueCol + "</tr>";
	}
	this.widget.firstPartyCookies.$dialogTableBody.append(contentToAdd);
}

NodeWidgetHandler.prototype.loadThirdPartyCookies = function(node) {
	var cookies = node.getThirdPartyCookies();
	var contentToAdd = '';
	for(var key in cookies) {
		var keyCol = "<td>" + key + "</td>";
		var valueCol = "<td>" + cookies[key] + "</td>";
		contentToAdd += "<tr>" + keyCol + valueCol + "</tr>";
	}
	this.widget.thirdPartyCookies.$dialogTableBody.append(contentToAdd);
}

NodeWidgetHandler.prototype.emptyInfo = function() {
	this.widget.$container.hide();
	this.widget.requests.$dialogTableBody.empty();
	this.widget.firstPartyCookies.$dialogTableBody.empty();
	this.widget.thirdPartyCookies.$dialogTableBody.empty();
	this.selectedNode = null;
	this.widget.requests.loaded = false;
	this.widget.firstPartyCookies.loaded = false;
	this.widget.thirdPartyCookies.loaded = false;
}