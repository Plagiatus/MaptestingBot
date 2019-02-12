import * as Http from "http";
import * as Url from "url";
import { TestingSession, Utils } from "./utils";
import { test } from "./commands/test";
import { data, client, sessionManager } from "./main";
import { Guild } from "discord.js";
import * as request from "request";

export class SessionStarter {
    port: number = parseInt(process.env.PORT);
    server: Http.Server = Http.createServer();


    constructor() {
        console.debug("[HTTPSERVER] starting");
        if (!this.port)
            this.port = 8100;
        this.server.addListener("listening", this.handleListen.bind(this));
        this.server.addListener("request", this.handleRequest.bind(this));
        this.server.listen(this.port);
    }

    handleListen(): void {
        console.debug("[HTTPSERVER] Listening on port: " + this.port);
    }


    handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): void {
        // console.log("Request received: " + _request.url);

        let query: Url.UrlWithParsedQuery = Url.parse(_request.url, true);
        var sessionid: number = parseInt(<string>query.query.id);
        if (!sessionid) {
            console.log(`[HTTPSERVER] someone tried to start a session without an ID.`);
            request.get("https://plagiatus.github.io/MaptestingBot/server/error.html", function (error, resp, body) {

                if (!error && resp.statusCode == 200) {
                    let resp: string = body.toString();
                    resp = resp.replace("None available. This probably is a bug.", "No sessionID recieved. This shouldn't happen.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR1");
                    respond(_response, resp);
                } else {
                    respond(_response, `No sessionID recieved. This shouldn't happen.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR1<br><em>Please also tell your Admin "TPDL1"</em>`);
                }

            });
            return;
        }
        let newSession: TestingSession = <TestingSession>JSON.parse(JSON.stringify(query.query));
        for (let s of data.waitingSessions.values()) {
            if (s.id == newSession.id) {
                console.log(`[HTTPSERVER] session with id ${sessionid} successfully recieved. starting...`);
                request.get("https://plagiatus.github.io/MaptestingBot/server/success.html", function (error, resp, body) {

                    if (!error && resp.statusCode == 200) {
                        respond(_response, body.toString());
                    } else {
                        respond(_response, `Your session has been set up successfully. You can close this window now.<br><em>Please tell your Admin "TPDL0"</em>`);
                    }

                });
                newSession.ping = query.query["ping"] == "true" ? true : false;
                let sess: TestingSession = {
                    additionalInfo: newSession.additionalInfo,
                    endTimestamp: Infinity,
                    startTimestamp: Date.now(),
                    hostID: s.hostID,
                    id: s.id,
                    ip: newSession.ip,
                    mapDescription: newSession.mapDescription,
                    mapTitle: newSession.mapTitle,
                    maxParticipants: newSession.maxParticipants,
                    platform: newSession.platform,
                    resourcepack: newSession.resourcepack,
                    setupTimestamp: s.id,
                    state: "running",
                    category: newSession.category,
                    version: newSession.version,
                    guild: s.guild,
                    ping: newSession.ping
                }
                sessionManager.startNew(sess);
                return;
            }
        }

        console.log(`[HTTPSERVER] someone tried to start a session with an invalid ID: ${sessionid}`);
        request.get("https://plagiatus.github.io/MaptestingBot/server/error.html", function (error, resp, body) {

            if (!error && resp.statusCode == 200) {
                let resp: string = body.toString();
                resp = resp.replace("None available. This probably is a bug.", "Session ID not found. Probably caused by a timeout or a faulty sessionID.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR2");
                respond(_response, resp);
            } else {
                respond(_response, `Session ID not found. Probably caused by a timeout or a faulty sessionID.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR2<br><em>Please also tell your Admin "TPDL2"</em>`);
            }

        });

    }

}
function respond(_response: Http.ServerResponse, _text: string): void {
    // console.log("Preparing response: " + _text);
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.setHeader("content-type", "text/html; charset=utf-8");
    _response.write(_text);
    _response.end();
}





interface AssocStringString {
    [key: string]: string;
}