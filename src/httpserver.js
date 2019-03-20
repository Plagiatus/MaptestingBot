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
        console.debug("[HTTPSERVER] starting");
        if (!this.port)
            this.port = 8100;
        this.server.addListener("listening", this.handleListen.bind(this));
        this.server.addListener("request", this.handleRequest.bind(this));
        this.server.listen(this.port);
    }
    handleListen() {
        console.debug("[HTTPSERVER] Listening on port: " + this.port);
    }
    handleRequest(_request, _response) {
        // console.log("Request received: " + _request.url);
        let query = Url.parse(_request.url, true);
        var sessionid = parseInt(query.query.id);
        if (!sessionid) {
            let view = query.query.view;
            if (view == "list") {
                let allUsers = "[";
                main_1.db.getAll().then(mus => {
                    for (let i = 0; i < mus.length; i++) {
                        if (!mus[i].discordName)
                            continue;
                        allUsers += `{"name":"${mus[i].discordName}","xp":${mus[i].experience},"lvl":${utils_1.Utils.getLevelFromXP(mus[i].experience)},"h":${mus[i].sessionsHosted},"j":${mus[i].sessionsJoined}}`;
                        if (i < mus.length - 1)
                            allUsers += ",";
                    }
                    allUsers += "]";
                    console.log(allUsers);
                    request.get("https://plagiatus.github.io/MaptestingBot/server/list.html", function (error, resp, body) {
                        if (!error && resp.statusCode == 200) {
                            let resp = body.toString();
                            resp = resp.replace("RESULT", allUsers);
                            respond(_response, resp);
                        }
                        else {
                            respond(_response, "An Error occurred when trying to load list website");
                        }
                    });
                }).catch(e => {
                    respond(_response, "Something went wrong.");
                });
                return;
            }
            console.log(`[HTTPSERVER] someone tried to start a session without an ID.`);
            request.get("https://plagiatus.github.io/MaptestingBot/server/error.html", function (error, resp, body) {
                if (!error && resp.statusCode == 200) {
                    let resp = body.toString();
                    resp = resp.replace("None available. This probably is a bug.", "No sessionID recieved. This shouldn't happen.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR1");
                    respond(_response, resp);
                }
                else {
                    respond(_response, `No sessionID recieved. This shouldn't happen.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR1<br><em>Please also tell your Admin "TPDL1"</em>`);
                }
            });
            return;
        }
        let newSession = JSON.parse(JSON.stringify(query.query));
        for (let s of main_1.sessionManager.waitingSessions) {
            if (s.id == newSession.id) {
                // if (s.guild.members.get(s.hostID).presence.status == "offline") {
                //     console.log(`[HTTPSERVER] ${s.guild.members.get(s.hostID).user.tag} tried to start a session while offline.`);
                //     request.get("https://plagiatus.github.io/MaptestingBot/server/error.html", function (error, resp, body) {
                //         if (!error && resp.statusCode == 200) {
                //             let resp: string = body.toString();
                //             resp = resp.replace("None available. This probably is a bug.", "You are offline on discord. You can't start a session if you're offline.");
                //             respond(_response, resp);
                //         } else {
                //             respond(_response, `You are offline on discord. You can't start a session if you're offline.`);
                //         }
                //     });
                //     return;
                // }
                console.log(`[HTTPSERVER] session with id ${sessionid} successfully recieved. starting...`);
                request.get("https://plagiatus.github.io/MaptestingBot/server/success.html", function (error, resp, body) {
                    if (!error && resp.statusCode == 200) {
                        respond(_response, body.toString());
                    }
                    else {
                        respond(_response, `Your session has been set up successfully. You can close this window now.<br><em>Please tell your Admin "TPDL0"</em>`);
                    }
                });
                newSession.ping = query.query["ping"] == "true" ? true : false;
                let sess = {
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
                };
                main_1.sessionManager.startNew(sess);
                return;
            }
        }
        console.log(`[HTTPSERVER] someone tried to start a session with an invalid ID: ${sessionid}`);
        request.get("https://plagiatus.github.io/MaptestingBot/server/error.html", function (error, resp, body) {
            if (!error && resp.statusCode == 200) {
                let resp = body.toString();
                resp = resp.replace("None available. This probably is a bug.", "Session ID not found. Probably caused by a timeout or a faulty sessionID.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR2");
                respond(_response, resp);
            }
            else {
                respond(_response, `Session ID not found. Probably caused by a timeout or a faulty sessionID.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR2<br><em>Please also tell your Admin "TPDL2"</em>`);
            }
        });
    }
}
exports.SessionStarter = SessionStarter;
function respond(_response, _text) {
    // console.log("Preparing response: " + _text);
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.setHeader("content-type", "text/html; charset=utf-8");
    _response.write(_text);
    _response.end();
}
