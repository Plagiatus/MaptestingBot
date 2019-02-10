import * as Discord from "discord.js";
import { TestingSession, Utils, MongoUser } from "./utils";
import { data, db, client } from "./main";
import * as Config from "./config.json";
import { stringify } from "querystring";
import { debug } from "util";
import { ECANCELED } from "constants";

type sessionMessageTypes = "listingPre" | "listingEntry" | "listingPost" | "sessionPre" | "sessionInfo";

export class SessionManager {
    listing: Map<string, Discord.TextChannel>;
    sessionChannels: Map<number, Discord.CategoryChannel>;
    sessionMessages: Map<number, Map<sessionMessageTypes, Discord.Message>>;
    sessionRoles: Map<number, Discord.Role>;
    sessionPlayers: Map<number, Map<string, { joined: number, user: Discord.GuildMember }>>;

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
        this.sessionPlayers = new Map<number, Map<string, { joined: number, user: Discord.GuildMember }>>();
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
        this.sessionPlayers.set(session.id, new Map<string, { joined: number, user: Discord.GuildMember }>());

        session.guild.fetchMember(session.hostID).then(hostGuildMember => {
            this.sessionPlayers.get(session.id).set(hostGuildMember.id, { joined: Date.now(), user: hostGuildMember });
            let author: Discord.User = hostGuildMember.user;
            db.getUser(author.id, mu => {
                let listingPreContent: string = `${hostGuildMember} ist hosting a testingsession, testing ${session.mapTitle}.`;
                if(session.ping && Date.now() - mu.lastPing > Config.xpSettings.levels[0].pingcooldown * 3600000){
                    listingPreContent += ` @here\n_(if you want to mute pings, head to the bot-commands channel and use the ${Config.prefix}mute command)_`;
                    mu.lastPing = Date.now();
                }
                //listing messages
                this.listing.get(session.guild.id).send(listingPreContent).then(
                    newListingPreMessage => {
                        this.sessionMessages.get(session.id).set("listingPre", <Discord.Message>newListingPreMessage);
                        this.listing.get(session.guild.id).send(Utils.SessionToListingEmbed(session, author, mu)).then(
                            newListingPostMessage => {
                                this.sessionMessages.get(session.id).set("listingEntry", <Discord.Message>newListingPostMessage);
                                this.listing.get(session.guild.id).send(`🌱 ${author} 🇭 created the session.`).then(
                                    newListingPostMessage => {
                                        this.sessionMessages.get(session.id).set("listingPost", <Discord.Message>newListingPostMessage);

                                        (<Discord.Message>newListingPostMessage).react(data.usedEmojis.get(session.guild.id).get("join")).then(() => {
                                            let rc: Discord.ReactionCollector = (<Discord.Message>newListingPostMessage).createReactionCollector(m => { return m.emoji == data.usedEmojis.get(session.guild.id).get("join") }, { time: 18000000 });
                                            rc.on("collect", collected => {
                                                for (let reactedUser of collected.users.values()) {
                                                    if (reactedUser.id != client.user.id) {
                                                        //add users to session if they reaced
                                                        collected.remove(reactedUser);
                                                        session.guild.fetchMember(reactedUser.id).then(
                                                            reactedGuildUser => {
                                                                //TODO: check if they set their Username

                                                                //is session full?
                                                                if (this.sessionRoles.get(session.id).members.size >= session.maxParticipants + 1)   //+1 because host doesn't count
                                                                {
                                                                    this.sessionMessages.get(session.id).get("listingPost").edit(`The session is full.`);
                                                                    return;
                                                                }
                                                                //is user in a session already?
                                                                this.sessionRoles.forEach(role => {
                                                                    if (reactedGuildUser.roles.has(role.id)) {
                                                                        this.sessionMessages.get(session.id).get("listingPost").edit(`❌ ${reactedGuildUser} you already are in a session.`);
                                                                        return;
                                                                    }
                                                                    reactedGuildUser.addRole(this.sessionRoles.get(session.id));
                                                                    this.sessionMessages.get(session.id).get("listingPost").edit(`${data.usedEmojis.get(session.guild.id).get("joined")} ${reactedGuildUser} joined the session.`);
                                                                    this.sessionPlayers.get(session.id).set(reactedGuildUser.id, { joined: Date.now(), user: reactedGuildUser });
                                                                    //send message to session text channel
                                                                    for (let c of this.sessionChannels.get(session.id).children.values()) {
                                                                        if (c.type == "text") {
                                                                            db.getUser(reactedUser.id, mu => {
                                                                                (<Discord.TextChannel>c).send(Utils.JoinedEmbed(reactedGuildUser, mu, session.platform));
                                                                            });
                                                                        }
                                                                    }
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
                    hostGuildMember.addRole(r);

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
                // TODO: add all the XP etc to the users.
                for (let userInSession of this.sessionPlayers.get(session.id).values()) {
                    // console.log(`${userInSession.user.nickname} was in here for ${(Date.now() - userInSession.joined) / 1000} seconds`);
                    Utils.handleSessionOverUserUpdates(session, userInSession);
                }
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
            setTimeout(c.delete.bind(c), i * 500);
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