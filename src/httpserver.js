"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStarter = void 0;
const Http = require("http");
const utils_1 = require("./utils");
const main_1 = require("./main");
const express = require("express");
const path = require("path");
class SessionStarter {
    constructor() {
        this.port = parseInt(process.env.PORT);
        this.app = express();
        this.server = Http.createServer(this.app);
        console.debug("[HTTPSERVER] starting");
        if (!this.port)
            this.port = 8100;
        this.server.addListener("listening", this.handleListen.bind(this));
        this.server.listen(this.port);
        console.log("static", path.join(__dirname + "./../server"));
        this.app.use(express.static(path.join(__dirname + "./../server")));
        this.app.get("/start", this.handleStartRequest);
        this.app.get("/full-list", this.handleFullListRequest);
    }
    handleListen() {
        console.debug("[HTTPSERVER] Listening on port: " + this.port);
    }
    handleStartRequest(_request, _response) {
        var sessionid = parseInt(_request.query["id"]);
        if (!sessionid) {
            console.log(`[HTTPSERVER] someone tried to start a session without an ID.`);
            _response.redirect("/error.html?error=No sessionID recieved. This shouldn't happen.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR1");
            return;
        }
        else {
            //TODO: validate recieved data and abort if anything went wrong
            //return;
        }
        let newSession = _request.query;
        for (let s of main_1.sessionManager.waitingSessions) {
            if (s.id == newSession.id) {
                console.log(`[HTTPSERVER] session with id ${sessionid} successfully recieved. starting...`);
                _response.redirect("/success.html");
                //@ts-expect-error
                newSession.ping = newSession.ping == "true" ? true : false;
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
        _response.redirect("/error.html?error=Session ID not found. Probably caused by a timeout or a faulty sessionID.<br>Please start a new session and let the Admins know of this Problem.<br>ErrorCode: SR2");
    }
    handleFullListRequest(_request, _response) {
        let allUsers = [];
        main_1.db.getAll().then(mus => {
            for (let i = 0; i < mus.length; i++) {
                if (!mus[i].discordName)
                    continue;
                allUsers.push({ name: mus[i].discordName, xp: mus[i].experience, lvl: utils_1.Utils.getLevelFromXP(mus[i].experience), h: mus[i].sessionsHosted, j: mus[i].sessionsJoined });
            }
            _response.setHeader("content-type", "application/json");
            _response.json(allUsers);
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
