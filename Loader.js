//Module for loading data

module.exports = {
    //Loads a .json file and returns it parsed
    loadParsedJson: function loadParsedJson(filename, callback){
        var fs = require('fs');

        fs.readFile('./config/' + filename + '.json', 'utf8', function(err, data){
            if (!err){
                var result = JSON.parse(data);
                while (result == undefined){ }
                callback(undefined, result);
            } else {
                callback(err, undefined);
            }
        });
    }

    //
}
