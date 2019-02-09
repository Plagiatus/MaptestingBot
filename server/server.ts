import * as Http from "http";
import * as Https from "https";
import * as Url from "url";
import * as fs from "fs";
import * as request from "request";

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
    console.log("Request received: " + _request.url);

    let query: AssocStringString = Url.parse(_request.url, true).query;
    let sessionid: number = parseInt(query["sessionid"]);
    let timestamp: string = query["timestamp"];
    if (!sessionid) {
        respond(_response, "something went wrong, please retry.");
    } else {
        request.get("https://plagiatus.github.io/MaptestingBot/server/setup.html", function (error, resp, body) {
            
            if (!error && resp.statusCode == 200) {
                respond(_response, body.toString()
                .replace("sessionIDValue",sessionid.toString())
                .replace("STARTTIMESTAMPHERE",timestamp ? timestamp : Date.now().toString)
                );
            }

        });
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