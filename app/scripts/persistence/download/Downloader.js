"use strict";

function Downloader() {}

Downloader.prototype.saveFileAs = function(data, contentType, fileName) {
	saveAs(new Blob([data], {type: contentType}), fileName);
}