window.monitor = true;
archive = {};
tabsMappings = {};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(changeInfo.hasOwnProperty('url') && changeInfo.url.substring(0,4) == "http") {
		tabsMappings[tabId] = {'initialURL': changeInfo.url};
		if(!archive.hasOwnProperty(changeInfo.url)) archive[changeInfo.url] = {'requests': []}
   		//console.log(changeInfo);
   	}
});

chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {
		if(monitor) logRequest(details);
	},
	{urls: ["<all_urls>"]}
);

function logRequest(details) {
	if(tabsMappings.hasOwnProperty(details.tabId)) {
		initialURL = tabsMappings[details.tabId].initialURL;
		archive[initialURL].requests.push(details);
		addRequestNode(initialURL, details);
	} 
	//else console.log(details);	//irrelevant requests (Chrome functionalities)
}