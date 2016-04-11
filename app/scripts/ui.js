$(function() {
	$( "#node_requests_dialog, #edge_requests_dialog" ).dialog({
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
		width: $(window).width()*0.6,
		height: $(window).height()*0.6
	});
 
	$( "#node_requests_opener" ).click(function() {
		$( "#node_requests_dialog" ).dialog( "open" );
	});
	$( "#edge_requests_opener" ).click(function() {
		$( "#edge_requests_dialog" ).dialog( "open" );
	});
});

function enablePostParamsDialog() {
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
				width: $(window).width()*0.3,
				height: $(window).height()*0.3,
				stack: true
			})
		);  
	}).click(function() {
		$.data(this, 'dialog').dialog('open');
		return false;  
	});  
}