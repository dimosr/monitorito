"use strict";

/* For reference of the widget structure, check InterfaceHandler.initManipulationWidgetHandler */
function ManipulationWidgetHandler(controller, widget, screenDimensions) {
	this.widget = widget;
	this.controller = controller;

	this.screenDimensions = screenDimensions;
	this.init();
}

ManipulationWidgetHandler.prototype.init = function() {
	var dialogOptions = {
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
		if(event.data.handler.controller.existExpandedNodes()) $.alert("Cannot create cluster, when there are expanded resources. Please collapse all resources first.", "Clustering Error");
		else if(event.data.handler.controller.isFilterActive()) $.alert("Cannot create cluster, because the graph is filtered. Please reset filter first.", "Clustering Error");
		else event.data.handler.widget.clustering.$clusterOptions.dialog("open");
	});
	this.widget.clustering.$addRowButton.click({handler: this}, function(event) {
		event.data.handler.widget.clustering.$clusterForm.find("fieldset").eq(1).append("<input class='domain' type='text'>");
	});
	this.widget.clustering.$submitButton.click({handler: this}, function(event) {
		event.data.handler.executeClustering();
	});
	this.widget.clustering.$cancelButton.click({handler: this}, function(event) {
		event.data.handler.resetClusteringForm();
		event.data.handler.widget.clustering.$clusterOptions.dialog("close");
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
		if(event.data.handler.controller.existClusters()) $.alert("Cannot apply Filtering, when there are active clusters. Please delete all clusters first.", "Filtering Error");
		else event.data.handler.widget.filtering.$filterOptions.dialog("open");
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

		if(this.widget.clustering.$tabs.tabs("option", "active") == 0)
			this.executeClusteringWithDomains(clusterID);
		else if(this.widget.clustering.$tabs.tabs("option", "active") == 1)
			this.executeClusteringWithRegExp(clusterID);
	}
	catch(err) {
		$.alert(err.message, "Clustering Error");
	}
}

ManipulationWidgetHandler.prototype.executeClusteringWithDomains = function(clusterID) {
	var domains = [];
	this.widget.clustering.$clusterForm.find("input.domain").each(
		function(idx, elem) {
			if(elem.value.trim() != "") domains.push(elem.value);
		}
	);
	var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
	clusterOptions.setDomains(domains);

	this.controller.clusterByDomain(clusterOptions, clusterID);
	this.widget.clustering.$clusterOptions.dialog("close");
	this.resetClusteringForm();
}

ManipulationWidgetHandler.prototype.executeClusteringWithRegExp = function(clusterID) {
	var regExp = new RegExp(this.widget.clustering.$clusterForm.find("input[name='regexp']").val());
	var clusterOptions = new ClusterOptions(ClusterOptions.operationType.REGEXP);
	clusterOptions.setRegExp(regExp);

	this.controller.clusterByDomain(clusterOptions, clusterID);
	this.widget.clustering.$clusterOptions.dialog("close");
	this.resetClusteringForm();
}

ManipulationWidgetHandler.prototype.resetClusteringForm = function() {
	this.widget.clustering.$clusterForm[0].reset();
	this.widget.clustering.$clusterForm.find("input.domain").not(":first").remove();
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

ManipulationWidgetHandler.prototype.hide = function() {
	this.widget.$container.hide();
}