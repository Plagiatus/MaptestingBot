"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const Url = require("url");
const fs = require("fs");
console.log("Server starting");
let port = process.env.PORT;
if (port == undefined)
    port = 8100;
let server = Http.createServer();
server.addListener("listening", handleListen);
server.addListener("request", handleRequest);
server.listen(port);
function handleListen() {
    console.log("Listening on port: " + port);
}
function handleRequest(_request, _response) {
    console.log("Request received: " + _request.url);
    let query = Url.parse(_request.url, true).query;
    var sessionid = parseInt(query["sessionid"]);
    if (!sessionid) {
        respond(_response, "something went wrong, please retry.");
    }
    else {
        fs.readFile("./server.html", function (err, resp) {
            if (err)
                respond(_response, err.message);
            else {
                respond(_response, resp.toString().replace("sessionIDValue", sessionid.toString()));
            }
        });
    }
    // findCallback is an inner function so that _response is in scope
    function findCallback(json) {
        respond(_response, json);
    }
}
function respond(_response, _text) {
    //console.log("Preparing response: " + _text);
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.setHeader("content-type", "text/html; charset=utf-8");
    _response.write(_text);
    _response.end();
}
