"use strict";

/* For reference of the widget structure, check InterfaceHandler.initNodeWidgetHandler */
function NodeWidgetHandler(controller, widget, screenDimensions) {
	this.widget = widget;
	this.selectedNode = null;
	this.requestsLoaded = false;

	this.screenDimensions = screenDimensions;
	this.init();
}

NodeWidgetHandler.prototype.init = function() {
	var dialogOptions = {
		autoOpen: false,
		modal: true,
		width: this.screenDimensions.width*0.6,
		height: this.screenDimensions.height*0.6
	};
	this.widget.$dialogContent.dialog(dialogOptions);
	this.widget.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.widget;
		if(!handler.requestsLoaded) {
			handler.loadNodeRequests(handler.selectedNode);
			handler.requestsLoaded = true;
		}
		widget.$dialogContent.dialog( "open" );
	});
}

NodeWidgetHandler.prototype.showInfo = function(node) {
	this.widget.$domainField.html(node.getDomain());
	this.widget.$requestsNumberField.html(node.getRequests().length);
	
	this.selectedNode = node;
	this.widget.$container.show();
}

NodeWidgetHandler.prototype.loadNodeRequests = function(node) {
	var requests = node.getRequests();

	var requestsRows = "";
	for(var i=0; i < requests.length; i++) {
		var request = requests[i];
		var typeColumn = "<td>" + request.type + "</td>";
		var methodColumn = "<td>" + request.method + "</td>";
		var urlColumn = "<td>" + request.url + "</td>";
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
		requestsRows += "<tr>" + typeColumn + methodColumn + urlColumn + bodyColumn + "</tr>";
	}
	this.widget.$dialogTableBody.append(requestsRows);
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

NodeWidgetHandler.prototype.emptyInfo = function() {
	this.widget.$container.hide();
	this.widget.$dialogTableBody.empty();
	this.selectedNode = null;
	this.requestsLoaded = false;
}