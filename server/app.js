const express = require('express');
const fs = require('fs');
const app = express();

var numLogs = 0;
var logLines = 0;

app.use((req, res, next) => {
// write your logging code here
    var agent = req.headers["user-agent"].replace(",", "");
    var time = new Date().toISOString();
    var method = req.method;
    var resource = req.originalUrl;
    var version = "HTTP/" + req.httpVersion;
    var status = res.statusCode;
    log = `${agent},${time},${method},${resource},${version},${status}`
    fs.appendFileSync('./log.csv','\n' + log);
    console.log(log);
    logLines++;
    if (logLines >= 19){
        //create new csv file, edit all previous log names
        console.log("/log.csv is full, creating new log.")
        for (i = numLogs; i < 0; i--){
            fs.renameSync("./log"+ i +".csv", "./log" + i + 1 +".csv");
        }
        fs.renameSync("./log.csv", "./log1.csv");
        console.log("New log created.")
        fs.appendFileSync('./log.csv', "Agent,Time,Method,Resource,Version,Status");
        numLogs++;
        logLines = 0;
    }
    next();
});

app.get('/', (req, res) => {
// write your code to respond "ok" here
    res.status(200);
    res.send('ok');
});

app.get('/logs', (req, res) => {
// write your code to return a json object containing the log data here
    var logData = fs.readFileSync("./log.csv", 'utf8');
    console.log("./log.csv loaded");
    for (i = 1; i < numLogs + 1; i++){
        let data = fs.readFileSync("./log" + i +".csv", 'utf8');
        console.log("./log" + i +".csv loaded");
        logData += "\n" + data;
    }
    logData = csvJSON(logData);
    res.json(logData);
});

function csvJSON(csv){
    var lines=csv.split("\n");
    var result = [];
    var headers=lines[0].split(",");
  
    for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].split(",");
  
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
        if (i % 20 != 0){
            result.push(obj);
        }
    }
    return result;
}

module.exports = app;
