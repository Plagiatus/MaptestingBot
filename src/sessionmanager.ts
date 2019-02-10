import * as Discord from "discord.js";
import { TestingSession, Utils, MongoUser } from "./utils";
import { data, db, client } from "./main";
import { stringify } from "querystring";
import { debug } from "util";
import { ECANCELED } from "constants";

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
        for (let i: number = 0; i < data.waitingSessions.length; i++) {
            if (data.waitingSessions[i].id == session.id) {
                data.waitingSessions.splice(i, 1);
                i--;
            }
        }
        if (session.maxParticipants <= 0)
            session.maxParticipants = Infinity;
        data.runningSessions.push(session);

        this.updateCategoryName(session.guild);

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
                                        let joinEmoji: Discord.Emoji;
                                        let joinedEmoji: Discord.Emoji;
                                        for (let e of session.guild.emojis.values()) {
                                            if (e.name == "join")
                                                joinEmoji = e;
                                            if (e.name == "joined")
                                                joinedEmoji = e;
                                        }
                                        (<Discord.Message>o).react(joinEmoji).then(() => {
                                            let rc: Discord.ReactionCollector = (<Discord.Message>o).createReactionCollector(m => {return m.emoji == joinEmoji}, {time:18000000});
                                            rc.on("collect", collected=> {
                                                for(let reactedUser of collected.users.values()){
                                                    if(reactedUser.id != client.user.id){
                                                        //add users to session if they reaced
                                                        collected.remove(reactedUser);
                                                        //is session full?
                                                        //is user in a session already?
                                                        session.guild.fetchMember(reactedUser.id).then(
                                                            reactedGuildUser => {
                                                                if(this.sessionRoles.get(session.id).members.size >= session.maxParticipants + 1)   //+1 because host doesn't count
                                                                {
                                                                    this.sessionMessages.get(session.id).get("listingPost").edit(`The session is full.`);
                                                                    return;
                                                                }
                                                                this.sessionRoles.forEach(role => {
                                                                    if(reactedGuildUser.roles.has(role.id)){
                                                                        this.sessionMessages.get(session.id).get("listingPost").edit(`❌ ${reactedGuildUser} you already are in a session.`);
                                                                        return;
                                                                    }
                                                                    reactedGuildUser.addRole(this.sessionRoles.get(session.id));
                                                                    this.sessionMessages.get(session.id).get("listingPost").edit(`${joinedEmoji} ${reactedGuildUser} joined the session.`);
                                                                    //TODO: send message to session text channel
                                                                });
                                                            }
                                                        );
                                                    }
                                                }
                                            });
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
                                    this.sessionMessages.get(session.id).set("sessionPre", <Discord.Message>m);
                                    (<Discord.Message>m).react("🛑").then(() => {
                                        let rc: Discord.ReactionCollector = (<Discord.Message>m).createReactionCollector(m => { return m.emoji.name == "🛑" });
                                        rc.on("collect", (collected) => {
                                            if (collected.users.has(session.hostID) && session.state == "running") {
                                                this.endSession(session);
                                                rc.stop();
                                            }
                                        })
                                    });
                                }
                            );
                            textchannel.send(Utils.SessionToSessionEmbed(session, author, mu)).then(
                                m => {
                                    this.sessionMessages.get(session.id).set("sessionInfo", <Discord.Message>m);
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
                                allow: ["MANAGE_CHANNELS", "VIEW_CHANNEL", "CONNECT"]
                            }
                        ]).then(c => {
                            let voicechannel: Discord.TextChannel = <Discord.TextChannel>c;
                            voicechannel.setParent(category.id).catch(r => {
                                console.error(r);
                            });
                        });
                    });
                });
            });
        });
    }

    endSession(session: TestingSession) {
        let sessionCategoryChannel: Discord.CategoryChannel = this.sessionChannels.get(session.id);
        for (let c of sessionCategoryChannel.children.values()) {
            if (c.type == "text") {
                let tc: Discord.TextChannel = <Discord.TextChannel>c;
                // TODO: change text to real text
                tc.send(`This session has ended. This channel will self-destruct in X seconds. bye bye!\n${this.sessionRoles.get(session.id)}`);
                console.log(`[SESSIONMANAGER] [${session.id}] Ending`);
                session.state = "ending";
                //TODO: add all the XP etc to the users.
            }
        }

        //remove session messages in listing
        this.sessionMessages.get(session.id).get("listingPre").delete();
        this.sessionMessages.get(session.id).get("listingEntry").delete();
        this.sessionMessages.get(session.id).get("listingPost").delete();
        this.sessionMessages.delete(session.id);

        //remove session from saved list
        data.runningSessions.splice(data.runningSessions.indexOf(session), 1);

        //finalise
        this.updateCategoryName(session.guild);

        setTimeout(this.destroySession.bind(this), 10000, session);
    }

    destroySession(session: TestingSession) {

        //remove session channels
        let sessionCategoryChannel: Discord.CategoryChannel = this.sessionChannels.get(session.id);
        let i: number = 1;
        for (let c of sessionCategoryChannel.children.values()) {
            setTimeout(c.delete.bind(c),i * 500);
            i++;
        }
        sessionCategoryChannel.delete();
        this.sessionChannels.delete(session.id);

        //remove session role
        this.sessionRoles.get(session.id).delete();
        this.sessionRoles.delete(session.id);

        //log
        console.log(`[SESSIONMANAGER] [${session.id}] Removed`);
    }

    updateCategoryName(guild: Discord.Guild) {
        let newName: string = "ERROR";
        if (data.runningSessions.length <= 0) {
            newName = "🔴 no active session";
        } else {
            newName = `🔵 ${data.runningSessions.length} active session${data.runningSessions.length > 1 ? "s" : ""}`;
        }
        this.listing.get(guild.id).parent.setName(newName);
    }
}