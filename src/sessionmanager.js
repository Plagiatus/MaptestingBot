"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const main_1 = require("./main");
const session_1 = require("./session");
class SessionManager {
    constructor() {
        this.waitingSessions = [];
        this.runningSessions = [];
        this.listing = new Map();
        for (let g of main_1.client.guilds.values()) {
            for (let c of g.channels.values()) {
                if (c.type == "text" && c.name == "listing") {
                    this.listing.set(g.id, c);
                }
            }
        }
        this.playersOffline = new Map();
        setInterval(this.checkOfflinePlayers.bind(this), 30000);
        setInterval(this.checkWaitingSessions.bind(this), 60000);
    }
    startNew(session) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: don't use DMs for starting a session, move channel and role creation to to setupSession
            console.log(`[SESSIONMANAGER] [${session.id}] Start`);
            if (session.maxParticipants <= 0)
                session.maxParticipants = Infinity;
            let hostGuildMember = yield session.guild.fetchMember(session.hostID);
            try {
                let newSession = new session_1.Session(session, this.listing.get(session.guild.id));
                newSession.start();
                for (let i = 0; i < this.waitingSessions.length; i++) {
                    if (this.waitingSessions[i].id == session.id) {
                        this.waitingSessions.splice(i, 1);
                        i--;
                    }
                }
                this.runningSessions.push(newSession);
                this.updateCategoryName(session.guild);
            }
            catch (error) {
                hostGuildMember.user.send("Something went wrong when creating/starting the session. Please reload the success page to try again.\nIf the Problem persists, contact an admin.\n_There should be more detailed information above this._");
            }
        });
    }
    getRunningSession(id) {
        for (let i = 0; i < this.runningSessions.length; i++) {
            if (this.runningSessions[i].id == id)
                return this.runningSessions[i];
        }
        return null;
    }
    leaveSession(id, member, kicked = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let s = this.getRunningSession(id);
            s.textChannel.send(utils_1.Utils.LeftEmbed(member, kicked));
            member.removeRole(s.role);
            if (!kicked)
                utils_1.Utils.handleSessionLeavingUserXP(s, s.players.get(member.id));
            s.players.delete(member.id);
            this.playersOffline.delete(member.id);
            s.sessionMessages.get("listingEntry").edit("", utils_1.Utils.SessionToListingEmbed(s, s.hostGuildMember.user));
            s.sessionMessages.get("listingPost").edit(`${main_1.data.usedEmojis.get(s.guild.id).get("left")} ${member} left the session.`);
        });
    }
    endSession(id, byMod = false) {
        let s = this.getRunningSession(id);
        if (!s)
            return;
        s.endSession(byMod);
        //remove session from saved list
        this.runningSessions.splice(this.runningSessions.indexOf(s), 1);
        this.updateCategoryName(s.guild);
        //TODO: set correct time.
        if (byMod)
            setTimeout(this.destroySession.bind(this), 10000, s);
        else
            setTimeout(this.destroySession.bind(this), 30000, s);
    }
    destroySession(session) {
        session.destroySession();
        //log
        console.log(`[SESSIONMANAGER] [${session.id}] Ended. There are now ${this.runningSessions.length} running.`);
    }
    updateCategoryName(guild) {
        let newName = "ERROR";
        if (this.runningSessions.length <= 0) {
            newName = "🔴 no active session";
        }
        else {
            newName = `🔵 ${this.runningSessions.length} active session${this.runningSessions.length > 1 ? "s" : ""}`;
        }
        this.listing.get(guild.id).parent.setName(newName);
    }
    checkOfflinePlayers() {
        if (this.playersOffline.size == 0)
            return;
        for (let player of this.playersOffline.keys()) {
            if (this.playersOffline.get(player).timestamp < Date.now() - 120000) {
                let session = this.runningSessions.find(s => { return s.hostID == player; });
                if (session) {
                    //host
                    this.endSession(session.id);
                }
                else {
                    //not the host
                    session = utils_1.Utils.getSessionFromUserId(this.playersOffline.get(player).user.id);
                    if (session)
                        this.leaveSession(session.id, this.playersOffline.get(player).user);
                }
                this.playersOffline.delete(player);
            }
        }
    }
    checkWaitingSessions() {
        for (let i = 0; i < this.waitingSessions.length; i++) {
            if (this.waitingSessions[i].setupTimestamp < Date.now() - 600000) {
                console.log(`[DATAHANDLER] Session #${this.waitingSessions[i].id} has been removed for being idle for too long.`);
                this.waitingSessions.splice(i, 1);
                i--;
            }
        }
    }
}
exports.SessionManager = SessionManager;
