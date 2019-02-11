"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const main_1 = require("./main");
const Config = require("./config.json");
const register_1 = require("./commands/register");
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
        this.sessionPlayers = new Map();
    }
    startNew(session) {
        console.log(`[SESSIONMANAGER] [${session.id}] Starting`);
        for (let i = 0; i < main_1.data.waitingSessions.length; i++) {
            if (main_1.data.waitingSessions[i].id == session.id) {
                main_1.data.waitingSessions.splice(i, 1);
                i--;
            }
        }
        if (session.maxParticipants <= 0)
            session.maxParticipants = Infinity;
        main_1.data.runningSessions.push(session);
        this.updateCategoryName(session.guild);
        this.sessionMessages.set(session.id, new Map());
        this.sessionPlayers.set(session.id, new Map());
        session.guild.fetchMember(session.hostID).then(hostGuildMember => {
            this.sessionPlayers.get(session.id).set(hostGuildMember.id, { joined: Date.now(), user: hostGuildMember });
            let author = hostGuildMember.user;
            main_1.db.getUser(author.id, mu => {
                let listingPreContent = `${hostGuildMember} ist hosting a testingsession, testing ${session.mapTitle}.`;
                if (session.ping && Date.now() - mu.lastPing > Config.xpSettings.levels[0].pingcooldown * 60 * 60 * 1000) {
                    listingPreContent += ` @here\n_(if you want to mute pings, head to the bot-commands channel and use the ${Config.prefix}mute command)_`;
                    mu.lastPing = Date.now();
                    main_1.db.insertUser(mu);
                    this.listing.get(session.guild.id).overwritePermissions(main_1.data.disableNotificationsRole.get(session.guild.id).id, { VIEW_CHANNEL: false, READ_MESSAGES: false });
                }
                //listing messages
                this.listing.get(session.guild.id).send(listingPreContent).then(newListingPreMessage => {
                    this.listing.get(session.guild.id).overwritePermissions(main_1.data.disableNotificationsRole.get(session.guild.id).id, { VIEW_CHANNEL: true, READ_MESSAGES: true });
                    this.sessionMessages.get(session.id).set("listingPre", newListingPreMessage);
                    this.listing.get(session.guild.id).send(utils_1.Utils.SessionToListingEmbed(session, author, mu)).then(newListingPostMessage => {
                        this.sessionMessages.get(session.id).set("listingEntry", newListingPostMessage);
                        this.listing.get(session.guild.id).send(`🌱 ${author} 🇭 created the session.`).then(newListingPostMessage => {
                            this.sessionMessages.get(session.id).set("listingPost", newListingPostMessage);
                            newListingPostMessage.react(main_1.data.usedEmojis.get(session.guild.id).get("join")).then(() => {
                                let rc = newListingPostMessage.createReactionCollector(m => { return m.emoji == main_1.data.usedEmojis.get(session.guild.id).get("join"); }, { time: 18000000 });
                                rc.on("collect", collected => {
                                    for (let reactedUser of collected.users.values()) {
                                        if (reactedUser.id != main_1.client.user.id) {
                                            //add users to session if they reaced
                                            collected.remove(reactedUser);
                                            session.guild.fetchMember(reactedUser.id).then(reactedGuildUser => {
                                                main_1.db.getUser(reactedGuildUser.id, reacedMongoUser => {
                                                    if ((!reacedMongoUser.mcJavaIGN && session.platform == "java") || (!reacedMongoUser.mcBedrockIGN && session.platform == "bedrock")) {
                                                        this.sessionMessages.get(session.id).get("listingPost").edit(`❓ ${reactedGuildUser} you don't have your username set for this platform. Please use ${Config.prefix}${register_1.register.name} in a bot channel first.`);
                                                        return;
                                                    }
                                                    //is session full?
                                                    if (this.sessionRoles.get(session.id).members.size > session.maxParticipants) //+1 because host doesn't count
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
                                                        this.sessionMessages.get(session.id).get("listingPost").edit(`${main_1.data.usedEmojis.get(session.guild.id).get("joined")} ${reactedGuildUser} joined the session.`);
                                                        this.sessionPlayers.get(session.id).set(reactedGuildUser.id, { joined: Date.now(), user: reactedGuildUser });
                                                        //send message to session text channel
                                                        for (let c of this.sessionChannels.get(session.id).children.values()) {
                                                            if (c.type == "text") {
                                                                main_1.db.getUser(reactedUser.id, mu => {
                                                                    this.sessionMessages.get(session.id).get("listingEntry").edit("", utils_1.Utils.SessionToListingEmbed(session, author, mu));
                                                                    c.send(utils_1.Utils.JoinedEmbed(reactedGuildUser, mu, session.platform));
                                                                });
                                                            }
                                                        }
                                                    });
                                                });
                                            });
                                        }
                                    }
                                });
                            });
                        });
                    });
                });
                //session channels & messages
                let sessionRole;
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
                            id: main_1.client.user.id,
                            allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL"]
                        }
                    ]).then(category => {
                        this.sessionChannels.set(session.id, category);
                        //create Text channel
                        category.guild.createChannel("chat", "text", [
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
                                            rc.stop();
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
                                allow: ["MANAGE_CHANNELS", "VIEW_CHANNEL", "CONNECT"]
                            }
                        ]).then(c => {
                            let voicechannel = c;
                            voicechannel.setParent(category.id).catch(r => {
                                console.error(r);
                            });
                        });
                    });
                });
            });
        });
    }
    leaveSession(session, member, kicked = false) {
        this.sessionMessages.get(session.id).get("sessionInfo").channel.send(utils_1.Utils.LeftEmbed(member, kicked));
        member.removeRole(this.sessionRoles.get(session.id));
        if (!kicked)
            utils_1.Utils.handleSessionLeavingUserXP(session, this.sessionPlayers.get(session.id).get(member.id));
        this.sessionPlayers.get(session.id).get(member.id);
        this.sessionPlayers.get(session.id).delete(member.id);
        main_1.db.getUser(member.id, mu => {
            this.sessionMessages.get(session.id).get("listingEntry").edit("", utils_1.Utils.SessionToListingEmbed(session, member.user, mu));
        });
    }
    endSession(session) {
        let sessionCategoryChannel = this.sessionChannels.get(session.id);
        for (let c of sessionCategoryChannel.children.values()) {
            if (c.type == "text") {
                let tc = c;
                //TODO: set correct time text here & mention the possibility to !tip
                tc.send(`This session has ended. This channel will self-destruct in 10 seconds.\nThank you for playing and bye bye!\n${this.sessionRoles.get(session.id)}`);
                console.log(`[SESSIONMANAGER] [${session.id}] Ending`);
                session.state = "ending";
                for (let userInSession of this.sessionPlayers.get(session.id).values()) {
                    utils_1.Utils.handleSessionLeavingUserXP(session, userInSession);
                }
            }
        }
        //remove session messages in listing
        this.sessionMessages.get(session.id).get("listingPre").delete();
        this.sessionMessages.get(session.id).get("listingEntry").delete();
        this.sessionMessages.get(session.id).get("listingPost").delete();
        this.sessionMessages.delete(session.id);
        //remove session from saved list
        main_1.data.runningSessions.splice(main_1.data.runningSessions.indexOf(session), 1);
        //finalise
        this.updateCategoryName(session.guild);
        //TODO: set correct time.
        setTimeout(this.destroySession.bind(this), 10000, session);
    }
    destroySession(session) {
        //remove session channels
        let sessionCategoryChannel = this.sessionChannels.get(session.id);
        let i = 1;
        for (let c of sessionCategoryChannel.children.values()) {
            setTimeout(c.delete.bind(c), i * 500);
            i++;
        }
        setTimeout(sessionCategoryChannel.delete.bind(sessionCategoryChannel), 1500);
        this.sessionChannels.delete(session.id);
        //remove session role
        this.sessionRoles.get(session.id).delete();
        this.sessionRoles.delete(session.id);
        //log
        console.log(`[SESSIONMANAGER] [${session.id}] Ended`);
    }
    updateCategoryName(guild) {
        let newName = "ERROR";
        if (main_1.data.runningSessions.length <= 0) {
            newName = "🔴 no active session";
        }
        else {
            newName = `🔵 ${main_1.data.runningSessions.length} active session${main_1.data.runningSessions.length > 1 ? "s" : ""}`;
        }
        this.listing.get(guild.id).parent.setName(newName);
    }
}
exports.SessionManager = SessionManager;
