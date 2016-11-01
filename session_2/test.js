function extractCharacters(str) {
    str = str.toLowerCase();
    var uniqueChar = {}, data = str.split(''), ret = [];
    data.forEach(function(ch) {
        if (uniqueChar[ch] === undefined) {
            ret.push(ch);
            uniqueChar[ch] = true;
        }
    });
    return ret;
}


function createLogger(prefix) {
    return console.log.bind(console, (new Date()).toISOString() + " " + prefix + ": ");
}
