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
		}
	});
 
	$( "#node_requests_opener" ).click(function() {
		$( "#node_requests_dialog" ).dialog( "open" );
	});
	$( "#edge_requests_opener" ).click(function() {
		$( "#edge_requests_dialog" ).dialog( "open" );
	});
});