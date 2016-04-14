function Util(){}

Util.escapeHtml = function (text) {
    var escMap = { 
        '"': '&quot;',
        "'": '&#039;',
        '&': '&amp;', 
        '<': '&lt;', 
        '>': '&gt;' 
    };
    return text.replace(/[\"'&<>]/g, function (a) { return escMap[a]; });
};