console.log("Loading Logger...");

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

var exports = module.exports = {};

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();
    var month = months[date.getMonth()];

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return month + "/" + day + "/" + year + " " + (hour > 12 ? hour - 12 : hour) + ":" + min + ":" + sec + (hour > 12 ? "pm" : "am");
}

exports.logCommand = function logCommand(command){
    console.log("Log: " + getDateTime() + ": Command Called '" + command + "'");
}

exports.log = function log(log){
    console.log("Log: " + getDateTime() + ": " + log);
}

exports.logError = function logError(log){
    console.error("Error:  " + getDateTime() + ": Code: '" + log + "'");
}

exports.logWarn = function logWarn(log){
    console.warn("Warn:  " + getDateTime() + ": Warning: '" + log + "'");
}