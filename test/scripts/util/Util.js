QUnit.module( "uti.Util" );

QUnit.test( "Util.escapeHtml(): text without html tags", function( assert ) {
	var original = 'simple text';
	assert.equal( original, Util.escapeHtml(original), "same message was returned" );
});

QUnit.test( "Util.escapeHtml(): text with html tags", function( assert ) {
	var original = 'a "text" & <tags>';
	var escaped = 'a &quot;text&quot; &amp; &lt;tags&gt;';
	assert.equal( escaped, Util.escapeHtml(original), "html special characters were escaped" );
});

QUnit.test( "Util.getUrlHostname(): http url with simple domain", function( assert ) {
	var url = 'http://www.example.com/folder/file.extension#hash';
	var expectedHostname = "www.example.com";
	assert.equal( expectedHostname, Util.getUrlHostname(url), "http://www.example.com/folder/file.extension#hash gives hostname = www.example.com" );
});

QUnit.test( "Util.getUrlHostname(): https url with subdomains and port", function( assert ) {
	var url = 'https://www.pre.sub.example.com:8080/subfolder';
	var expectedHostname = "www.pre.sub.example.com";
	assert.equal( expectedHostname, Util.getUrlHostname(url), "https://www.pre.sub.example.com:8080/subfolder gives hostname = www.pre.sub.example.com" );
});