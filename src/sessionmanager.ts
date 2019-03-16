import * as Discord from "discord.js";
import { TestingSession, Utils, UserInSession, MongoUser } from "./utils";
import { data, db, client } from "./main";
import { sessionMessageTypes, Session } from "./session";
import * as Config from "./config.json";
import { register } from "./commands/register";
import { tip } from "./commands/tip";

export class SessionManager {
    listing: Map<string, Discord.TextChannel>;
    playersOffline: Map<string, UserInSession>;
    waitingSessions: TestingSession[];
    runningSessions: Session[];

    constructor() {
        this.waitingSessions = [];
        this.runningSessions = [];
        this.listing = new Map<string, Discord.TextChannel>();
        for (let g of client.guilds.values()) {
            for (let c of g.channels.values()) {
                if (c.type == "text" && c.name == "listing") {
                    this.listing.set(g.id, <Discord.TextChannel>c);
                }
            }
        }
        this.playersOffline = new Map<string, UserInSession>();
        setInterval(this.checkOfflinePlayers.bind(this), 30000);
        setInterval(this.checkWaitingSessions.bind(this), 60000)
    }

    async startNew(session: TestingSession) {
        //TODO: don't use DMs for starting a session, move channel and role creation to to setupSession
        //TODO: if a muted user pings, remove their mute role and make them aware of their hipocracy.
        console.log(`[SESSIONMANAGER] [${session.id}] Start`);

        if (session.maxParticipants <= 0) session.maxParticipants = Infinity;

        let hostGuildMember: Discord.GuildMember = await session.guild.fetchMember(session.hostID);
        try {
            let newSession: Session = new Session(session, this.listing.get(session.guild.id));
            newSession.start();
            for (let i: number = 0; i < this.waitingSessions.length; i++) {
                if (this.waitingSessions[i].id == session.id) {
                    this.waitingSessions.splice(i, 1);
                    i--;
                }
            }
            this.runningSessions.push(newSession);
            this.updateCategoryName(session.guild);

        } catch (error) {
            hostGuildMember.user.send("Something went wrong when creating/starting the session. Please reload the success page to try again.\nIf the Problem persists, contact an admin.\n_There should be more detailed information above this._")
        }
    }

    getRunningSession(id: number): Session {
        for (let i: number = 0; i < this.runningSessions.length; i++) {
            if (this.runningSessions[i].id == id) return this.runningSessions[i];
        }
        return null;
    }

    async leaveSession(id: number, member: Discord.GuildMember, kicked: boolean = false) {
        let s: Session = this.getRunningSession(id);
        s.sessionMessages.get("sessionInfo").channel.send(Utils.LeftEmbed(member, kicked));
        member.removeRole(s.role);
        if (!kicked)
            Utils.handleSessionLeavingUserXP(s, s.players.get(member.id));
        s.players.delete(member.id);
        this.playersOffline.delete(member.id);
        let mu: MongoUser = await db.getUser(member.id);
        s.sessionMessages.get("listingEntry").edit("", Utils.SessionToListingEmbed(s, member.user, mu));
        s.sessionMessages.get("listingPost").edit(`${data.usedEmojis.get(s.guild.id).get("left")} ${member} left the session.`);
    }

    endSession(id: number, byMod: boolean = false) {
        let s: Session = this.getRunningSession(id);
        if(!s) return;
        s.endSession(byMod);

        //remove session from saved list
        this.runningSessions.splice(this.runningSessions.indexOf(s), 1);

        this.updateCategoryName(s.guild);

        
        //TODO: set correct time.
        if (byMod) setTimeout(this.destroySession.bind(this), 10000, s);
        else setTimeout(this.destroySession.bind(this), 30000, s);
    }

    destroySession(session: Session) {
        session.destroySession();
        //log
        console.log(`[SESSIONMANAGER] [${session.id}] Ended`);
    }

    updateCategoryName(guild: Discord.Guild) {
        let newName: string = "ERROR";
        if (this.runningSessions.length <= 0) {
            newName = "🔴 no active session";
        } else {
            newName = `🔵 ${this.runningSessions.length} active session${this.runningSessions.length > 1 ? "s" : ""}`;
        }
        this.listing.get(guild.id).parent.setName(newName);
    }

    checkOfflinePlayers() {
        if (this.playersOffline.size == 0) return;
        for (let player of this.playersOffline.keys()) {
            if (this.playersOffline.get(player).timestamp < Date.now() - 120000) {
                let session: TestingSession = this.runningSessions.find(s => { return s.hostID == player });
                if (session) {
                    //host
                    this.endSession(session.id);
                } else {
                    //not the host
                    session = Utils.getSessionFromUserId(this.playersOffline.get(player).user.id)
                    if (session)
                        this.leaveSession(session.id, this.playersOffline.get(player).user);
                }
                this.playersOffline.delete(player);
            }
        }
    }


    checkWaitingSessions() {
        for (let i: number = 0; i < this.waitingSessions.length; i++) {
            if (this.waitingSessions[i].setupTimestamp < Date.now() - 600000) {
                console.log(`[DATAHANDLER] Session #${this.waitingSessions[i].id} has been removed for being idle for too long.`)
                this.waitingSessions.splice(i, 1);
                i--;
            }
        }
    }
}