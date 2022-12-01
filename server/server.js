"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const Url = require("url");
const request = require("request");
console.log("Server starting");
let port = parseInt(process.env.PORT);
if (!port)
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
    let query = Url.parse(_request.url, true);
    let sessionid = parseInt(query.query["sessionid"]);
    let timestamp = query.query["timestamp"];
    if (!sessionid) {
        respond(_response, "something went wrong, please retry.");
    }
    else {
        request.get("./setup.html", function (error, resp, body) {
            if (!error && resp.statusCode == 200) {
                let resp = body.toString();
                resp = resp.replace("sessionIDValue", sessionid.toString());
                if (!timestamp) {
                    resp = resp.replace("STARTTIMESTAMPHERE", Date.now().toString());
                }
                else {
                    resp = resp.replace("STARTTIMESTAMPHERE", timestamp);
                }
                respond(_response, resp);
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
