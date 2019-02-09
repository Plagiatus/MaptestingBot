"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const Url = require("url");
const utils_1 = require("./utils");
const main_1 = require("./main");
const request = require("request");
class SessionStarter {
    constructor() {
        this.port = parseInt(process.env.PORT);
        this.server = Http.createServer();
        console.log("Http Server starting", this.port);
        if (!this.port)
            this.port = 8100;
        console.log(this.port);
        this.server.addListener("listening", this.handleListen.bind(this));
        this.server.addListener("request", this.handleRequest.bind(this));
        this.server.listen(this.port);
    }
    handleListen() {
        console.log("Listening on port: " + this.port);
    }
    handleRequest(_request, _response) {
        console.log("Request received: " + _request.url);
        let query = Url.parse(_request.url, true);
        var sessionid = parseInt(query.query.id);
        if (!sessionid) {
            console.log(`someone tried to start a session without an ID.`);
            request.get("https://plagiatus.github.io/MaptestingBot/server/error.html", function (error, resp, body) {
                if (!error && resp.statusCode == 200) {
                    let resp = body.toString();
                    resp = resp.replace("None available. This probably is a bug.", "No sessionID recieved. This shouldn't happen.\nPlease start a new session and let the Admins know of this Problem.\nErrorCode: SR1");
                    this.respond(_response, resp);
                }
                else {
                    this.respond(_response, "No sessionID recieved. This shouldn't happen.\nPlease start a new session and let the Admins know of this Problem.\nErrorCode: SR1");
                }
            });
            return;
        }
        let test = JSON.parse(JSON.stringify(query));
        for (let s of main_1.data.waitingSessions.values()) {
            if (s.id == test.id) {
                console.log(`session with id ${sessionid} successfully recieved. starting...`);
                request.get("https://plagiatus.github.io/MaptestingBot/server/success.html", function (error, resp, body) {
                    if (!error && resp.statusCode == 200) {
                        this.respond(_response, body.toString());
                    }
                    else {
                        this.respond(_response, "Session started. You can close this window now.");
                    }
                });
                let sess = {
                    additionalInfo: test.additionalInfo,
                    endTimestamp: Infinity,
                    startTimestamp: Date.now(),
                    hostID: s.hostID,
                    id: s.id,
                    ip: test.ip,
                    mapDescription: test.mapDescription,
                    mapTitle: test.mapTitle,
                    maxParticipants: test.maxParticipants,
                    platform: test.platform,
                    resourcepack: test.resourcepack,
                    setupTimestamp: s.id,
                    state: "running",
                    category: test.category,
                    version: test.version,
                    guild: s.guild,
                };
                main_1.data.waitingSessions.splice(main_1.data.waitingSessions.indexOf(s), 1);
                main_1.data.runningSessions.push(sess);
                sess.guild.defaultChannel.send(utils_1.Utils.SessionToEmbed(sess));
                return;
            }
        }
        console.log(`someone tried to start a session with an invalid ID: ${sessionid}`);
        request.get("https://plagiatus.github.io/MaptestingBot/server/error.html", function (error, resp, body) {
            console.log(error, resp.statusCode);
            if (!error && resp.statusCode == 200) {
                let resp = body.toString();
                resp = resp.replace("None available. This probably is a bug.", "Session ID not found. Probably caused by a timeout or a faulty sessionID.\nPlease start a new session and let the Admins know of this Problem.\nErrorCode: SR2");
                this.respond(_response, resp);
            }
            else {
                this.respond(_response, "Session ID not found. Probably caused by a timeout or a faulty sessionID.\nPlease start a new session and let the Admins know of this Problem.\nErrorCode: SR2");
            }
        });
    }
    respond(_response, _text) {
        // console.log("Preparing response: " + _text);
        _response.setHeader("Access-Control-Allow-Origin", "*");
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.write(_text);
        _response.end();
    }
}
exports.SessionStarter = SessionStarter;
