"use strict";

/* For reference of the widget structure, check InterfaceHandler.initManipulationWidgetHandler */
function ManipulationWidgetHandler(controller, widget, screenDimensions, batchImportWidgetHandler) {
	this.widget = widget;
	this.controller = controller;
	this.batchImportWidgetHandler = batchImportWidgetHandler;

	this.screenDimensions = screenDimensions;
	this.init();
}

ManipulationWidgetHandler.prototype.init = function() {
	var dialogOptions = {
		dialogClass: "no-close",
		autoOpen: false,
		modal: true,
		width: this.screenDimensions.width*0.6,
		height: this.screenDimensions.height*0.85,
		draggable: false
	};

	this.initClusteringManipulation(dialogOptions);
	this.initFilteringManipulation(dialogOptions);
	this.initExpandCollapseManipulation();

}

ManipulationWidgetHandler.prototype.initClusteringManipulation = function(dialogOptions) {
	this.widget.clustering.$clusterOptions.dialog(dialogOptions);

	this.widget.clustering.$clusterButton.click({handler: this}, function(event) {
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
			handler.setClusteringDomains(domains);
		}, handler.getDomains());
	});
	this.widget.clustering.$declusterAllButton.click({handler: this}, function(event) {
		event.data.handler.controller.deleteAllClusters();
	});
}

ManipulationWidgetHandler.prototype.initFilteringManipulation = function(dialogOptions) {
	this.widget.filtering.$filterOptions.dialog(dialogOptions);
	this.widget.filtering.$filteringRules.dialog(dialogOptions);
	this.widget.filtering.$filteringRules.dialog("option", "resizable", "false");
	
	this.widget.filtering.$filterButton.click({handler: this}, function(event) {
		event.data.handler.widget.filtering.$filterOptions.dialog("open");
	});
	this.widget.filtering.$submitButton.click({handler: this}, function(event) {
		event.data.handler.executeFiltering();
	});
	this.widget.filtering.$cancelButton.click({handler: this}, function(event) {
		event.data.handler.resetFilteringForm();
		event.data.handler.widget.filtering.$filterOptions.dialog("close");
	});
	this.widget.filtering.$resetFilter.click({handler: this}, function(event) {
		if(event.data.handler.controller.isFilterActive()) event.data.handler.controller.resetFilter();
	});
	this.generateMetricsFormFields();
	this.setupFieldsValidation();
}

ManipulationWidgetHandler.prototype.initExpandCollapseManipulation = function() {
	this.widget.$collapseAllButton.click({handler: this}, function(event) {
		event.data.handler.controller.collapseAllNodes();
	});
	this.widget.$expandAllButton.click({handler: this}, function(event) {
		try {
			event.data.handler.controller.expandAllNodes();
		}
		catch(err) {
			$.alert(err.message, "Resource Expanding Error");
		}
	});
}

ManipulationWidgetHandler.prototype.executeClustering = function() {
	try{
		var clusterID = this.widget.clustering.$clusterForm.find("input[name='cluster-id']").val();
		if(clusterID.trim() == "") throw new Error("Cluster ID field is empty! You have to provide a value.");

		var clusterOptions = this.getClusterOptions();
		this.controller.cluster(clusterOptions, clusterID);
		this.widget.clustering.$clusterOptions.dialog("close");
		this.resetClusteringForm();
	}
	catch(err) {
		$.alert(err.message, "Clustering Error");
	}
}

ManipulationWidgetHandler.prototype.setClusteringDomains = function(domains) {
	this.resetDomains();
	for(var i = 0; i < domains.length; i++) {
		if(i != 0) this.addDomainInputRow();
		this.widget.clustering.$clusterForm.find("input.domain").eq(i).val(domains[i]);
	}
}

ManipulationWidgetHandler.prototype.getClusterOptions = function() {
	if(this.widget.clustering.$tabs.tabs("option", "active") == 0)
		var clusterOptions = this.getDomainsClusterOptions();
	else if(this.widget.clustering.$tabs.tabs("option", "active") == 1)
		var clusterOptions = this.getRegExpClusterOptions();
	return clusterOptions;
}

ManipulationWidgetHandler.prototype.getDomainsClusterOptions = function() {
	var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
	clusterOptions.setDomains(this.getDomains());
	return clusterOptions;
}

ManipulationWidgetHandler.prototype.getDomains = function() {
	var domains = [];
	this.widget.clustering.$clusterForm.find("input.domain").each(
		function(idx, elem) {
			if(elem.value.trim() != "") domains.push(elem.value);
		}
	);
	return domains;
}

ManipulationWidgetHandler.prototype.getRegExpClusterOptions = function() {
	var regExp = new RegExp(this.widget.clustering.$clusterForm.find("input[name='regexp']").val());
	var clusterOptions = new ClusterOptions(ClusterOptions.operationType.REGEXP);
	clusterOptions.setRegExp(regExp);
	return clusterOptions;
}

ManipulationWidgetHandler.prototype.resetClusteringForm = function() {
	this.widget.clustering.$clusterForm[0].reset();
	this.resetDomains();
}

ManipulationWidgetHandler.prototype.resetDomains = function() {
	this.widget.clustering.$clusterForm.find("input.domain").not(":first").remove();
	this.widget.clustering.$clusterForm.find("input.domain").val("");
}

ManipulationWidgetHandler.prototype.executeFiltering = function() {
	try{
		var form = this.widget.filtering.$filterForm;

		if(form[0].checkValidity() == false) {
			this.showFilteringRules();
		}
		else {
			var filteringOptions = new FilterOptions();
			
			var operationType = form.find("input[name='operation']:checked").val();
			if(operationType == "and") filteringOptions.setOperationType(FilterOptions.operationType.AND);
			else if(operationType == "or") filteringOptions.setOperationType(FilterOptions.operationType.OR);

			var nodeID = form.find("input[name='node-id']").val();
			if(nodeID.trim() != "") filteringOptions.setDomainRegExp(new RegExp(nodeID));

			var inEdgesMin = form.find("#edges-in input[name='min']").val();
			if(inEdgesMin.trim() != "") filteringOptions.setEdgesMin("incoming", parseInt(inEdgesMin, 10));
			var inEdgesMax = form.find("#edges-in input[name='max']").val();
			if(inEdgesMax.trim() != "") filteringOptions.setEdgesMax("incoming", parseInt(inEdgesMax, 10));
			var outEdgesMin = form.find("#edges-out input[name='min']").val();
			if(outEdgesMin.trim() != "") filteringOptions.setEdgesMin("outgoing", parseInt(outEdgesMin, 10));
			var outEdgesMax = form.find("#edges-out input[name='max']").val();
			if(outEdgesMax.trim() != "") filteringOptions.setEdgesMax("outgoing", parseInt(outEdgesMax, 10));

			var metrics = form.find("fieldset[name='metrics'] > fieldset");
			for(var i = 0; i < metrics.length; i++) {
				var metric = metrics.eq(i).attr("name");
				var min = metrics.eq(i).find("input[name='min']").val();
				var max = metrics.eq(i).find("input[name='max']").val();
				if(min.trim() != "") filteringOptions.setMetricMin(metric, parseInt(min, 10));
				if(max.trim() != "") filteringOptions.setMetricMax(metric, parseInt(max, 10));
			}

			var depth = form.find("input[name='depth']").val();
			if(depth.trim() != "") filteringOptions.setNeighboursDepth(parseInt(depth, 10));

			this.controller.applyFilter(filteringOptions);
			this.widget.filtering.$filterOptions.dialog("close");
			this.resetFilteringForm();
		}

	}
	catch(err) {
		$.alert(err.message, "Filtering Error");
	}
}

ManipulationWidgetHandler.prototype.showFilteringRules = function() {
	this.widget.filtering.$filteringRules.dialog("open");
}

ManipulationWidgetHandler.prototype.generateMetricsFormFields = function() {
	var form = this.widget.filtering.$filterForm;
	var metricsFields = form.find("fieldset[name='metrics']");
	var metricFieldset = form.find("fieldset[name='metrics'] > fieldset");

	NodeMetricsFactory.getInstance().getMetrics().forEach(function(metric) {
		var newFieldset = metricFieldset.clone();
		newFieldset.attr("name", metric.getCodeName());
		newFieldset.find(".metric-label").text(metric.getDisplayName());
		newFieldset.find("input[name='min']").attr({
			"min": metric.getMinValue(),
			"max": metric.getMaxValue(),
			"placeholder": metric.getMinValue()
		});
		newFieldset.find("input[name='max']").attr({
			"min": metric.getMinValue(),
			"max": metric.getMaxValue(),
			"placeholder": metric.getMaxValue()
		});
		metricsFields.append(newFieldset);
	});
	metricFieldset.remove();
}

ManipulationWidgetHandler.prototype.setupFieldsValidation = function() {
	this.widget.filtering.$filterForm.find("input").blur(function() {
		if($(this)[0].checkValidity() == true) $(this).removeClass("invalid");
		else  $(this).addClass("invalid");
	});
	this.widget.filtering.$filterForm.find("input[name='node-id']").off("blur").blur(function() {
		try{
			new RegExp($(this).val());
			$(this).removeClass("invalid");
		}
		catch(invalidRegExprError) {
			$(this).addClass("invalid");
		}
	});
}

ManipulationWidgetHandler.prototype.resetFilteringForm = function() {
	this.widget.filtering.$filterForm[0].reset();
}

ManipulationWidgetHandler.prototype.addDomainInputRow = function() {
	this.widget.clustering.$clusterForm.find("fieldset").eq(1).append("<input class='domain' type='text'>");
}

ManipulationWidgetHandler.prototype.hide = function() {
	this.widget.$container.hide();
}