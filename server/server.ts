import * as Http from "http";
import * as Url from "url";

console.log("Server starting");

let port: number = process.env.PORT;
if (port == undefined)
    port = 8100;

let server: Http.Server = Http.createServer();
server.addListener("listening", handleListen);
server.addListener("request", handleRequest);
server.listen(port);


function handleListen(): void {
    console.log("Listening on port: " + port);
}

function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): void {
    console.log("Request received");

    let query: AssocStringString = Url.parse(_request.url, true).query;
    var sessionid: number = parseInt(query["sessionid"]);
    if(!sessionid){
        respond(_response, "something went wrong, please retry.");
    } else {
        respond(_response, "<h1>hooray!<h1>");
    }


    // findCallback is an inner function so that _response is in scope
    function findCallback(json: string): void {
        respond(_response, json);
    }
}

function respond(_response: Http.ServerResponse, _text: string): void {
    //console.log("Preparing response: " + _text);
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.setHeader("content-type", "text/html; charset=utf-8");
    _response.write(_text);
    _response.end();
}

interface AssocStringString {
    [key: string]: string;
}