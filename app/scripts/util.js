/* Function for escaping text, including HTML symbols */
var escapeHtml = (function () {
    var escMap = { 
        '"': '&quot;', 
        '&': '&amp;', 
        '<': '&lt;', 
        '>': '&gt;' 
    };
    return function (text) {
        return text.replace(/[\"&<>]/g, function (a) { return escMap[a]; });
    };
}());