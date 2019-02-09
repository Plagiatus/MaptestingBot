"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const main_1 = require("./main");
class SessionManager {
    constructor() {
        this.sessionChannels = new Map();
        this.listing = new Map();
        for (let g of main_1.client.guilds.values()) {
            for (let c of g.channels.values()) {
                if (c.type == "text" && c.name == "listing") {
                    this.listing.set(g.id, c);
                }
            }
        }
        this.sessionMessages = new Map();
        this.sessionRoles = new Map();
    }
    startNew(session) {
        //TODO: ping if allowed
        console.log(`[SESSIONMANAGER] [${session.id}] Starting`);
        for (let s of main_1.data.waitingSessions.values()) {
            if (s.id == session.id) {
                main_1.data.waitingSessions.splice(main_1.data.waitingSessions.indexOf(s), 1);
            }
        }
        if (session.maxParticipants <= 0)
            session.maxParticipants = Infinity;
        main_1.data.runningSessions.push(session);
        this.sessionMessages.set(session.id, new Map());
        session.guild.fetchMember(session.hostID).then(u => {
            let author = u.user;
            main_1.db.getUser(author.id, mu => {
                //listing messages
                this.listing.get(session.guild.id).send("New testing session started. Click to join").then(m => {
                    this.sessionMessages.get(session.id).set("listingPre", m);
                    this.listing.get(session.guild.id).send(utils_1.Utils.SessionToListingEmbed(session, author, mu)).then(n => {
                        this.sessionMessages.get(session.id).set("listingEntry", n);
                        this.listing.get(session.guild.id).send(`🌱 ${author} 🇭 created the session.`).then(o => {
                            this.sessionMessages.get(session.id).set("listingPost", o);
                            let emoji;
                            for (let e of session.guild.emojis.values()) {
                                if (e.name == "join")
                                    emoji = e;
                            }
                            o.react(emoji).then(() => {
                                //TODO: Add Emoji listener for joining
                            });
                        });
                    });
                });
                //session channels & messages
                let sessionRole;
                session.guild.createRole({ name: `session-${session.id}`, color: "#0eb711", mentionable: true }).then(r => {
                    sessionRole = r;
                    this.sessionRoles.set(session.id, r);
                    u.addRole(r);
                    //create overarching Category
                    session.guild.createChannel(`session #${session.id}`, "category", [
                        {
                            id: session.guild.id,
                            deny: ["VIEW_CHANNEL", "READ_MESSAGES"]
                        },
                        {
                            id: sessionRole.id,
                            allow: ["VIEW_CHANNEL", "READ_MESSAGES"]
                        },
                        {
                            id: main_1.client.user.id,
                            allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL"]
                        }
                    ]).then(category => {
                        this.sessionChannels.set(session.id, category);
                        //create Text channel
                        category.guild.createChannel("Text", "text", [
                            {
                                id: session.guild.id,
                                deny: ["VIEW_CHANNEL", "READ_MESSAGES"]
                            },
                            {
                                id: sessionRole.id,
                                allow: ["VIEW_CHANNEL", "READ_MESSAGES"]
                            },
                            {
                                id: main_1.client.user.id,
                                allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL"]
                            }
                        ]).then(c => {
                            let textchannel = c;
                            textchannel.setParent(category);
                            textchannel.send("🛑 End the session").then(m => {
                                this.sessionMessages.get(session.id).set("sessionPre", m);
                                m.react("🛑").then(() => {
                                    let rc = m.createReactionCollector(m => { return m.emoji.name == "🛑"; });
                                    rc.on("collect", (collected) => {
                                        if (collected.users.has(session.hostID) && session.state == "running") {
                                            this.endSession(session);
                                        }
                                    });
                                });
                            });
                            textchannel.send(utils_1.Utils.SessionToSessionEmbed(session, author, mu)).then(m => {
                                this.sessionMessages.get(session.id).set("sessionInfo", m);
                            });
                        });
                        //create Voice channel
                        category.guild.createChannel("Voice", "voice", [
                            {
                                id: session.guild.id,
                                deny: ["VIEW_CHANNEL", "CONNECT"]
                            },
                            {
                                id: sessionRole.id,
                                allow: ["VIEW_CHANNEL", "CONNECT"]
                            },
                            {
                                id: main_1.client.user.id,
                                allow: ["MANAGE_CHANNELS", "VIEW_CHANNEL"]
                            }
                        ]).then(c => {
                            console.debug("voice channel created");
                            let voicechannel = c;
                            console.log(category.id, voicechannel.id);
                            voicechannel.setParent(category.id).catch(r => {
                                console.error(r);
                            });
                            console.debug("voice channel moved");
                        });
                    });
                });
            });
        });
    }
    endSession(session) {
        let sessionCategoryChannel = this.sessionChannels.get(session.id);
        for (let c of sessionCategoryChannel.children.values()) {
            if (c.type == "text") {
                let tc = c;
                tc.send(`This session has ended. This channel will self-destruct in X seconds. bye bye!\n${this.sessionRoles.get(session.id)}`);
                console.log(`[SESSIONMANAGER] [${session.id}] Ending`);
                session.state = "ending";
            }
        }
        setTimeout(this.destroySession.bind(this), 10000, session);
    }
    destroySession(session) {
        console.log(`[SESSIONMANAGER] [${session.id}] Removed`);
        let sessionCategoryChannel = this.sessionChannels.get(session.id);
        for (let c of sessionCategoryChannel.children.values()) {
            c.delete();
        }
        sessionCategoryChannel.delete();
        this.sessionChannels.delete(session.id);
        this.sessionMessages.delete(session.id);
        this.sessionRoles.get(session.id).delete();
        this.sessionRoles.delete(session.id);
    }
}
exports.SessionManager = SessionManager;
