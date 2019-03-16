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
const Config = require("./config.json");
const register_1 = require("./commands/register");
const tip_1 = require("./commands/tip");
class SessionManager {
    constructor() {
        this.waitingSessions = [];
        this.runningSessions = [];
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
        this.playersOffline = new Map();
        setInterval(this.checkOfflinePlayers.bind(this), 30000);
        setInterval(this.checkWaitingSessions.bind(this), 60000);
    }
    startNew(session) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: don't use DMs for starting a session, move channel and role creation to to setupSession
            //TODO: if a muted user pings, remove their mute role and make them aware of their hipocracy.
            console.log(`[SESSIONMANAGER] [${session.id}] Start`);
            for (let i = 0; i < this.waitingSessions.length; i++) {
                if (this.waitingSessions[i].id == session.id) {
                    this.waitingSessions.splice(i, 1);
                    i--;
                }
            }
            if (session.maxParticipants <= 0)
                session.maxParticipants = Infinity;
            this.runningSessions.push(session);
            this.updateCategoryName(session.guild);
            this.sessionMessages.set(session.id, new Map());
            this.sessionPlayers.set(session.id, new Map());
            let hostGuildMember = yield session.guild.fetchMember(session.hostID);
            this.sessionPlayers.get(session.id).set(hostGuildMember.id, { timestamp: Date.now(), user: hostGuildMember });
            let author = hostGuildMember.user;
            let mu = yield main_1.db.getUser(author.id);
            let listingPreContent = `${hostGuildMember} ist hosting a testingsession, testing ${session.mapTitle}.`;
            if (session.ping && Date.now() - mu.lastPing > Config.xpSettings.levels[0].pingcooldown * 60 * 60 * 1000) {
                listingPreContent += ` @here\n_(if you want to mute pings, head to the bot-commands channel and use the ${Config.prefix}mute command)_`;
                mu.lastPing = Date.now();
                main_1.db.insertUser(mu);
                this.listing.get(session.guild.id).overwritePermissions(main_1.data.disableNotificationsRole.get(session.guild.id).id, { VIEW_CHANNEL: false, READ_MESSAGES: false });
            }
            //listing messages
            let newListingPreMessage = yield this.listing.get(session.guild.id).send(listingPreContent);
            this.listing.get(session.guild.id).overwritePermissions(main_1.data.disableNotificationsRole.get(session.guild.id).id, { VIEW_CHANNEL: true, READ_MESSAGES: true });
            this.listing.get(session.guild.id).overwritePermissions(session.guild.id, { VIEW_CHANNEL: true, READ_MESSAGES: true });
            this.sessionMessages.get(session.id).set("listingPre", newListingPreMessage);
            let newListingMessage = yield this.listing.get(session.guild.id).send(utils_1.Utils.SessionToListingEmbed(session, author, mu));
            this.sessionMessages.get(session.id).set("listingEntry", newListingMessage);
            let newListingPostMessage = yield this.listing.get(session.guild.id).send(`🌱 ${author} 🇭 created the session.`);
            this.sessionMessages.get(session.id).set("listingPost", newListingPostMessage);
            //reaction collector
            yield newListingPostMessage.react(main_1.data.usedEmojis.get(session.guild.id).get("join"));
            let joinCollector = newListingPostMessage.createReactionCollector(m => { return m.emoji == main_1.data.usedEmojis.get(session.guild.id).get("join"); }, { time: 18000000 });
            joinCollector.on("collect", handleCollection.bind(this));
            function handleCollection(collected) {
                return __awaiter(this, void 0, void 0, function* () {
                    for (let reactedUser of collected.users.values()) {
                        if (reactedUser.id != main_1.client.user.id) {
                            //add users to session if they reacted
                            collected.remove(reactedUser);
                            let reactedGuildUser = yield session.guild.fetchMember(reactedUser.id);
                            let reacedMongoUser = yield main_1.db.getUser(reactedGuildUser.id);
                            //are they offline?
                            if (reactedGuildUser.presence.status == "offline") {
                                this.sessionMessages.get(session.id).get("listingPost").edit(`🔴 ${reactedGuildUser} you are marked as offline. Offline users can't join sessions.`);
                                return;
                            }
                            //did they set their username?
                            if ((!reacedMongoUser.mcJavaIGN && session.platform == "java") || (!reacedMongoUser.mcBedrockIGN && session.platform == "bedrock")) {
                                this.sessionMessages.get(session.id).get("listingPost").edit(`❓ ${reactedGuildUser} you don't have your username set for this platform. Please use ${Config.prefix}${register_1.register.name} in a bot channel first.`);
                                return;
                            }
                            //is session full?
                            if (this.sessionRoles.get(session.id).members.size > session.maxParticipants) {
                                this.sessionMessages.get(session.id).get("listingPost").edit(`The session is full.`);
                                return;
                            }
                            //is user in a session already?
                            for (let role of this.sessionRoles.values()) {
                                if (reactedGuildUser.roles.has(role.id)) {
                                    this.sessionMessages.get(session.id).get("listingPost").edit(`❌ ${reactedGuildUser} you already are in a session.`);
                                    return;
                                }
                            }
                            reactedGuildUser.addRole(this.sessionRoles.get(session.id));
                            this.sessionMessages.get(session.id).get("listingPost").edit(`${main_1.data.usedEmojis.get(session.guild.id).get("joined")} ${reactedGuildUser} joined the session.`);
                            this.sessionPlayers.get(session.id).set(reactedGuildUser.id, { timestamp: Date.now(), user: reactedGuildUser });
                            //send message to session text channel
                            for (let c of this.sessionChannels.get(session.id).children.values()) {
                                if (c.type == "text") {
                                    let mu = yield main_1.db.getUser(reactedUser.id);
                                    this.sessionMessages.get(session.id).get("listingEntry").edit("", utils_1.Utils.SessionToListingEmbed(session, author, mu));
                                    c.send(utils_1.Utils.JoinedEmbed(reactedGuildUser, mu, session.platform));
                                }
                            }
                        }
                    }
                });
            }
            //session channels & messages
            let sessionRole = yield session.guild.createRole({ name: `session-${session.id}`, color: "#C27C0E", mentionable: true, hoist: true });
            sessionRole.setPosition(main_1.data.levelRoles.get(session.guild.id).get(4).position + 1);
            this.sessionRoles.set(session.id, sessionRole);
            hostGuildMember.addRole(sessionRole);
            let permissionObj = [
                {
                    id: session.guild.id,
                    deny: ["VIEW_CHANNEL", "READ_MESSAGES", "CONNECT", "SPEAK"]
                },
                {
                    id: sessionRole.id,
                    allow: ["VIEW_CHANNEL", "READ_MESSAGES", "CONNECT", "SPEAK"]
                },
                {
                    id: main_1.client.user.id,
                    allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL"]
                }
            ];
            //moderators should get automatic permission
            for (let i = 0; i < main_1.data.permittedRoles.get(session.guild.id).length; i++) {
                permissionObj.push({
                    id: main_1.data.permittedRoles.get(session.guild.id)[i],
                    allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL", "CONNECT", "SPEAK"]
                });
            }
            //create overarching Category
            let categoryChannel = yield session.guild.createChannel(`session #${session.id}`, "category", permissionObj);
            this.sessionChannels.set(session.id, categoryChannel);
            //create Text channel
            let sessionTextChannel = yield categoryChannel.guild.createChannel("chat", "text", permissionObj);
            let textchannel = sessionTextChannel;
            textchannel.setParent(categoryChannel);
            let sessionPreMessage = yield textchannel.send("🛑 End the session");
            this.sessionMessages.get(session.id).set("sessionPre", sessionPreMessage);
            yield sessionPreMessage.react("🛑");
            let endCollector = sessionPreMessage.createReactionCollector(m => { return m.emoji.name == "🛑"; });
            endCollector.on("collect", (collected) => {
                let modEnds = false;
                for (let modID of main_1.data.permittedUsers.get(session.guild.id)) {
                    if (collected.users.has(modID))
                        modEnds = true;
                }
                if ((collected.users.has(session.hostID) || modEnds) && session.state == "running") {
                    this.endSession(session, modEnds && !collected.users.has(session.hostID));
                    endCollector.stop();
                }
            });
            categoryChannel.setPosition(this.listing.get(session.guild.id).position - 1);
            let m = yield textchannel.send(utils_1.Utils.SessionToSessionEmbed(session, author, mu));
            this.sessionMessages.get(session.id).set("sessionInfo", m);
            //create Voice channel
            let sessionVoiceChannel = yield categoryChannel.guild.createChannel("Voice", "voice", permissionObj);
            let voicechannel = sessionVoiceChannel;
            voicechannel.setParent(categoryChannel.id).catch(r => {
                console.error(r);
            });
        });
    }
    leaveSession(session, member, kicked = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sessionMessages.get(session.id).get("sessionInfo").channel.send(utils_1.Utils.LeftEmbed(member, kicked));
            member.removeRole(this.sessionRoles.get(session.id));
            if (!kicked)
                utils_1.Utils.handleSessionLeavingUserXP(session, this.sessionPlayers.get(session.id).get(member.id));
            this.sessionPlayers.get(session.id).get(member.id);
            this.sessionPlayers.get(session.id).delete(member.id);
            this.playersOffline.delete(member.id);
            let mu = yield main_1.db.getUser(member.id);
            this.sessionMessages.get(session.id).get("listingEntry").edit("", utils_1.Utils.SessionToListingEmbed(session, member.user, mu));
            this.sessionMessages.get(session.id).get("listingPost").edit(`${main_1.data.usedEmojis.get(session.guild.id).get("left")} ${member} left the session.`);
        });
    }
    endSession(session, byMod = false) {
        let sessionCategoryChannel = this.sessionChannels.get(session.id);
        for (let c of sessionCategoryChannel.children.values()) {
            if (c.type == "text") {
                let tc = c;
                //TODO: set correct time text here & mention the possibility to !tip
                if (byMod)
                    tc.send(`This session has been ended by a mod. This channel will be removed in 10 seconds.\nThank you for playing.\n${this.sessionRoles.get(session.id)}`);
                else
                    tc.send(`This session has ended. This channel will self-destruct in 30 seconds.\nThis is the last chance for the host to use \`${Config.prefix}${tip_1.tip.name}\` for this session.\n\nThank you for playing and bye bye!\n${this.sessionRoles.get(session.id)}`);
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
        this.runningSessions.splice(this.runningSessions.indexOf(session), 1);
        this.sessionPlayers.delete(session.id);
        //finalise
        this.updateCategoryName(session.guild);
        //TODO: set correct time.
        if (byMod)
            setTimeout(this.destroySession.bind(this), 10000, session);
        else
            setTimeout(this.destroySession.bind(this), 30000, session);
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
                    this.endSession(session);
                }
                else {
                    //not the host
                    session = utils_1.Utils.getSessionFromUserId(this.playersOffline.get(player).user.id);
                    if (session)
                        this.leaveSession(session, this.playersOffline.get(player).user);
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
