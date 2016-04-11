QUnit.module( "escapeHtml() function" );

QUnit.test( "text without html tags", function( assert ) {
	var original = 'simple text';
	assert.equal( original, escapeHtml(original), "Passed" );
});

QUnit.test( "text with html tags", function( assert ) {
	var original = 'a "text" & <tags>';
	var escaped = 'a &quot;text&quot; &amp; &lt;tags&gt;';
	assert.equal( escaped, escapeHtml(original), "Passed" );
});

QUnit.module( "escapeHtml() function" );

QUnit.test( "text without html tags", function( assert ) {
	var original = 'simple text';
	assert.equal( original, escapeHtml(original), "Passed" );
});