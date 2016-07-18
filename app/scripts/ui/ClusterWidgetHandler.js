"use strict";

/* For reference of the widget structure, check InterfaceHandler.initClusterWidgetHandler */
function ClusterWidgetHandler(controller, widget, screenDimensions, batchImportWidgetHandler) {
	this.widget = widget;
	this.controller = controller;
	this.batchImportWidgetHandler = batchImportWidgetHandler;

	this.cluster = null;

	this.screenDimensions = screenDimensions;
	this.init();
}

ClusterWidgetHandler.prototype.init = function() {
	var dialogOptions = {
		autoOpen: false,
		modal: true,
		width: this.screenDimensions.width*0.6,
		height: this.screenDimensions.height*0.6
	};
	this.widget.nodes.$dialogContent.dialog(dialogOptions);
	this.widget.clustering.$clusterOptions.dialog(dialogOptions);

	this.widget.nodes.$opener.click({handler: this}, function(event) {
		event.data.handler.widget.nodes.$dialogContent.dialog("open");
	});
	this.widget.$declusterButton.click({handler: this}, function(event) {
		event.data.handler.controller.deleteCluster(event.data.handler.widget.$clusterID.html());
	});
	
	this.widget.clustering.$editClusterButton.click({handler: this}, function(event) {
		event.data.handler.configureClusterForm();
		event.data.handler.widget.clustering.$clusterOptions.dialog("open");
	});
	this.widget.clustering.$submitButton.click({handler: this}, function(event) {
		event.data.handler.executeClustering();
	});
	this.widget.clustering.$cancelButton.click({handler: this}, function(event) {
		event.data.handler.resetClusteringForm();
		event.data.handler.widget.clustering.$clusterOptions.dialog("close");
	});
	this.widget.clustering.$addRowButton.click({handler: this}, function(event) {
		event.data.handler.addDomainInputRow();
	});
	this.widget.clustering.$batchImportButton.click({handler: this}, function(event) {
		var handler = event.data.handler;
		handler.batchImportWidgetHandler.openBatchImport(function callback(domains) {
			handler.setDomains(domains);
		}, handler.getDomains());
	});
}

ClusterWidgetHandler.prototype.showInfo = function(cluster) {
	this.cluster = cluster;
	var clusterNodes = cluster.getNodes();
	this.widget.$clusterID.html(cluster.getID());
	this.widget.nodes.$numberField.html(clusterNodes.length);
	this.loadClusteredNodes(clusterNodes);
	this.widget.$container.show();
}

ClusterWidgetHandler.prototype.loadClusteredNodes = function(nodes) {
	var contentToAdd = '';
	for(var i = 0; i < nodes.length; i++) {
		var nodeDomain = "<td>" + nodes[i].getDomain() + "</td>";
		contentToAdd += "<tr>" + nodeDomain + "</tr>";
	}
	this.widget.nodes.$dialogTableBody.append(contentToAdd);
}

ClusterWidgetHandler.prototype.emptyInfo = function() {
	this.cluster = null;
	this.widget.$container.hide();
	this.widget.$clusterID.empty();
	this.widget.nodes.$numberField.empty();
	this.widget.nodes.$dialogTableBody.empty();
}

ClusterWidgetHandler.prototype.configureClusterForm = function() {
	var clusterOptions = this.cluster.getClusterOptions();
	if(clusterOptions.getOperationType() == ClusterOptions.operationType.DOMAINS) {
		this.widget.clustering.$clusterForm.find("#domains-options").show();
		this.widget.clustering.$clusterForm.find("#regexp-options").hide();
		var domains = clusterOptions.getDomains();
		this.setDomains(domains);
	}
	else if(clusterOptions.getOperationType() == ClusterOptions.operationType.REGEXP) {
		this.widget.clustering.$clusterForm.find("#domains-options").hide();
		this.widget.clustering.$clusterForm.find("#regexp-options").show();
		this.widget.clustering.$clusterForm.find("input[name='regexp']").val(this.getStringFromRegexp(clusterOptions.getRegExp()));
		
	}
	this.widget.clustering.$clusterForm.find("input[name='cluster-id']").val(this.cluster.getID());
}

ClusterWidgetHandler.prototype.executeClustering = function() {
	try{
		var clusterID = this.cluster.getID();

		var clusterOptions = this.getClusterOptions();
		this.controller.editCluster(clusterOptions, clusterID);
		this.widget.clustering.$clusterOptions.dialog("close");
		this.resetClusteringForm();
	}
	catch(err) {
		$.alert(err.message, "Clustering Error");
	}
}

ClusterWidgetHandler.prototype.setDomains = function(domains) {
	this.resetDomains();
	for(var i = 0; i < domains.length; i++) {
		if(i != 0) this.addDomainInputRow();
		this.widget.clustering.$clusterForm.find("input.domain").eq(i).val(domains[i]);
	}
}

ClusterWidgetHandler.prototype.getClusterOptions = function() {
	if(this.cluster.getClusterOptions().getOperationType() == ClusterOptions.operationType.DOMAINS)
		var clusterOptions = this.getDomainsClusterOptions();
	else if(this.cluster.getClusterOptions().getOperationType() == ClusterOptions.operationType.REGEXP)
		var clusterOptions = this.getRegExpClusterOptions();
	console.log(clusterOptions);
	return clusterOptions;
}

ClusterWidgetHandler.prototype.getDomainsClusterOptions = function() {
	var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
	clusterOptions.setDomains(this.getDomains());
	return clusterOptions;
}

ClusterWidgetHandler.prototype.getDomains = function() {
	var domains = [];
	this.widget.clustering.$clusterForm.find("input.domain").each(
		function(idx, elem) {
			if(elem.value.trim() != "") domains.push(elem.value);
		}
	);
	return domains;
}

ClusterWidgetHandler.prototype.getRegExpClusterOptions = function() {
	var regExp = new RegExp(this.widget.clustering.$clusterForm.find("input[name='regexp']").val());
	var clusterOptions = new ClusterOptions(ClusterOptions.operationType.REGEXP);
	clusterOptions.setRegExp(regExp);
	return clusterOptions;
}

ClusterWidgetHandler.prototype.resetClusteringForm = function() {
	this.widget.clustering.$clusterForm[0].reset();
	this.resetDomains();
}

ClusterWidgetHandler.prototype.resetDomains = function() {
	this.widget.clustering.$clusterForm.find("input.domain").not(":first").remove();
	this.widget.clustering.$clusterForm.find("input.domain").val("");
}

ClusterWidgetHandler.prototype.addDomainInputRow = function() {
	this.widget.clustering.$clusterForm.find("fieldset").eq(1).append("<input class='domain' type='text'>");
}

/*	@Docs
	Removes slashes in beginning,end of Regular Expression
 */
ClusterWidgetHandler.prototype.getStringFromRegexp = function(regExp) {
	if(!(regExp instanceof RegExp)) throw new Error("Provided parameter not regular expression")
	var string = regExp.toString();
	return string.substr(1, string.length-2);
}