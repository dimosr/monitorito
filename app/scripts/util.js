/* Function parsing URL using browser parsing */
function parseURL(url) {

    var tempLink = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    tempLink.href = url;

    queries = tempLink.search.replace(/^\?/, '').split('&');
    for( i = 0; i < queries.length; i++ ) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }

    return {
        protocol: tempLink.protocol,
        host: tempLink.host,
        hostname: tempLink.hostname,
        port: tempLink.port,
        pathname: tempLink.pathname,
        search: tempLink.search,
        searchObject: searchObject,
        hash: tempLink.hash
    };
}