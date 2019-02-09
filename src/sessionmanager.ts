import * as Discord from "discord.js";
import { TestingSession, Utils, MongoUser } from "./utils";
import { data, db, client } from "./main";
import { stringify } from "querystring";

type sessionMessageTypes = "listingPre" | "listingEntry" | "listingPost" | "sessionPre" | "sessionInfo";

export class SessionManager {
    listing: Map<string, Discord.TextChannel>;
    sessionChannels: Map<number, Discord.CategoryChannel>;
    sessionMessages: Map<number, Map<sessionMessageTypes, Discord.Message>>;
    sessionRoles: Map<number, Discord.Role>;

    constructor() {
        this.sessionChannels = new Map<number, Discord.CategoryChannel>();
        this.listing = new Map<string, Discord.TextChannel>();
        for (let g of client.guilds.values()) {
            for (let c of g.channels.values()) {
                if (c.type == "text" && c.name == "listing") {
                    this.listing.set(g.id, <Discord.TextChannel>c);
                }
            }
        }
        this.sessionMessages = new Map<number, Map<sessionMessageTypes, Discord.Message>>();
        this.sessionRoles = new Map<number, Discord.Role>();
    }

    startNew(session: TestingSession) {

        //TODO: ping if allowed
        console.log(`[SESSIONMANAGER] [${session.id}] Starting`);
        for (let s of data.waitingSessions.values()) {
            if (s.id == session.id) {
                data.waitingSessions.splice(data.waitingSessions.indexOf(s), 1);
            }
        }
        if (session.maxParticipants <= 0)
            session.maxParticipants = Infinity;
        data.runningSessions.push(session);

        this.sessionMessages.set(session.id, new Map<sessionMessageTypes, Discord.Message>());

        session.guild.fetchMember(session.hostID).then(u => {
            let author: Discord.User = u.user;
            db.getUser(author.id, mu => {
                //listing messages
                this.listing.get(session.guild.id).send("New testing session started. Click to join").then(
                    m => {
                        this.sessionMessages.get(session.id).set("listingPre", <Discord.Message>m);
                        this.listing.get(session.guild.id).send(Utils.SessionToListingEmbed(session, author, mu)).then(
                            n => {
                                this.sessionMessages.get(session.id).set("listingEntry", <Discord.Message>n);
                                this.listing.get(session.guild.id).send(`🌱 ${author} 🇭 created the session.`).then(
                                    o => {
                                        this.sessionMessages.get(session.id).set("listingPost", <Discord.Message>o);
                                        let emoji: Discord.Emoji;
                                        for (let e of session.guild.emojis.values()) {
                                            if (e.name == "join")
                                                emoji = e;
                                        }
                                        (<Discord.Message>o).react(emoji).then(() => {
                                            //TODO: Add Emoji listener for joining
                                        });
                                    }
                                )
                            }
                        );
                    }
                );

                //session channels & messages
                let sessionRole: Discord.Role;
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
                            id: client.user.id,
                            allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL"]
                        }
                    ]).then(category => {
                        this.sessionChannels.set(session.id, <Discord.CategoryChannel>category);
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
                                id: client.user.id,
                                allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL"]
                            }
                        ]).then(c => {
                            let textchannel: Discord.TextChannel = <Discord.TextChannel>c;
                            textchannel.setParent(category);
                            textchannel.send("🛑 End the session").then(
                                m => {
                                    this.sessionMessages.get(session.id).set("sessionPre",<Discord.Message>m);
                                    (<Discord.Message>m).react("🛑").then(() => {
                                        let rc: Discord.ReactionCollector = (<Discord.Message>m).createReactionCollector(m => {return m.emoji.name == "🛑"});
                                        rc.on("collect", (collected) => {
                                            if(collected.users.has(session.hostID) && session.state=="running"){
                                                this.endSession(session);
                                            }
                                        })
                                    });
                                }
                            );
                            textchannel.send(Utils.SessionToSessionEmbed(session, author, mu)).then(
                                m => {
                                    this.sessionMessages.get(session.id).set("sessionInfo",<Discord.Message>m);
                                }
                            );
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
                                id: client.user.id,
                                allow: ["MANAGE_CHANNELS", "VIEW_CHANNEL"]
                            }
                        ]).then(c => {
                            console.debug("voice channel created")
                            let voicechannel: Discord.TextChannel = <Discord.TextChannel>c;
                            voicechannel.setParent(category);
                            console.debug("voice channel moved")
                        }).catch(r => {
                            console.error(r);
                        });
                    });
                });
            });
        });
    }

    endSession(session: TestingSession){
        let sessionCategoryChannel: Discord.CategoryChannel = this.sessionChannels.get(session.id);
        for(let c of sessionCategoryChannel.children.values()){
            if(c.type == "text"){
                let tc: Discord.TextChannel = <Discord.TextChannel>c;
                tc.send(`This session has ended. This channel will self-destruct in X seconds. bye bye!\n${this.sessionRoles.get(session.id)}`)
                console.log(`[SESSIONMANAGER] [${session.id}] Ending`);
                session.state="ending";
            }
        }
        setTimeout(this.destroySession.bind(this),10000,session);
    }

    destroySession(session: TestingSession){
        console.log(`[SESSIONMANAGER] [${session.id}] Removed`);
        let sessionCategoryChannel: Discord.CategoryChannel = this.sessionChannels.get(session.id);
        for(let c of sessionCategoryChannel.children.values()){
            c.delete();
        }
        sessionCategoryChannel.delete();
        this.sessionChannels.delete(session.id);
        this.sessionMessages.delete(session.id);
        this.sessionRoles.get(session.id).delete();
        this.sessionRoles.delete(session.id);
    }
}