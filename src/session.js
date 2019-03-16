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
const Config = require("./config.json");
const main_1 = require("./main");
const utils_1 = require("./utils");
const register_js_1 = require("./commands/register.js");
const tip_js_1 = require("./commands/tip.js");
class Session {
    constructor(ts, listingChannel) {
        this.id = ts.id;
        this.hostID = ts.hostID;
        this.setupTimestamp = ts.setupTimestamp;
        this.startTimestamp = Date.now();
        this.endTimestamp = Infinity;
        this.platform = ts.platform;
        this.version = ts.version;
        this.maxParticipants = ts.maxParticipants;
        this.mapTitle = ts.mapTitle;
        this.mapDescription = ts.mapDescription;
        this.additionalInfo = ts.additionalInfo;
        this.resourcepack = ts.resourcepack;
        this.ip = ts.ip;
        this.category = ts.category;
        this.state = "running";
        this.guild = ts.guild;
        this.ping = ts.ping;
        this.listing = listingChannel;
        this.sessionMessages = new Map();
        // this.hostGuildMember = hostGuildMember;
        this.players = new Map();
        console.log(`[SESSION] [${this.id}] created`);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.hostGuildMember = yield this.guild.fetchMember(this.hostID);
            //add host as a player
            this.players.set(this.hostGuildMember.id, { timestamp: Date.now(), user: this.hostGuildMember });
            //save author
            let author = this.hostGuildMember.user;
            let mu = yield main_1.db.getUser(author.id);
            if (!mu) {
                console.error(`[SESSION] [${this.id}] Couldn't get Mongo User`);
                author.send("Couldn't connect to database.");
                return null;
            }
            try {
                this.role = yield this.createRole();
                yield this.createChannels();
                this.createMessages(author, mu);
            }
            catch (error) {
                author.send("Couldn't set up the required roles, channels or messages.");
                this.role.delete();
                if (this.categoryChannel)
                    setTimeout(this.categoryChannel.delete, 500);
                if (this.textChannel)
                    setTimeout(this.textChannel.delete, 1000);
                if (this.voiceChannel)
                    setTimeout(this.voiceChannel.delete, 1500);
                return null;
            }
        });
    }
    createRole(depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let newRole;
            try {
                newRole = yield this.guild.createRole({ name: `session-${this.id}`, color: "#C27C0E", mentionable: true, hoist: true });
                newRole.setPosition(main_1.data.levelRoles.get(this.guild.id).get(4).position + 1);
                yield this.hostGuildMember.addRole(newRole);
                return newRole;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createRole: ${error}`);
                newRole.delete();
                if (depth < 5)
                    return this.createRole(depth + 1);
                else
                    return null;
            }
        });
    }
    createChannels() {
        return __awaiter(this, void 0, void 0, function* () {
            let permissionObj = [
                {
                    id: this.guild.id,
                    deny: ["VIEW_CHANNEL", "READ_MESSAGES", "CONNECT", "SPEAK"]
                },
                {
                    id: this.role.id,
                    allow: ["VIEW_CHANNEL", "READ_MESSAGES", "CONNECT", "SPEAK"]
                },
                {
                    id: main_1.client.user.id,
                    allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL"]
                }
            ];
            //moderators should get automatic permission
            for (let i = 0; i < main_1.data.permittedRoles.get(this.guild.id).length; i++) {
                permissionObj.push({
                    id: main_1.data.permittedRoles.get(this.guild.id)[i],
                    allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL", "CONNECT", "SPEAK"]
                });
            }
            try {
                this.categoryChannel = yield this.createCategoryChannel(permissionObj);
                this.textChannel = yield this.createTextChannel(permissionObj);
                this.voiceChannel = yield this.createVoiceChannel(permissionObj);
            }
            catch (error) {
            }
        });
    }
    createCategoryChannel(permissionObj, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let catChannel;
            try {
                catChannel = (yield this.guild.createChannel(`session #${this.id}`, "category", permissionObj));
                catChannel.setPosition(this.listing.position - 1);
                return catChannel;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createCategoryChannel: ${error}`);
                if (catChannel)
                    yield catChannel.delete();
                if (depth < 5)
                    return this.createCategoryChannel(permissionObj, depth + 1);
                else
                    return null;
            }
        });
    }
    createTextChannel(permissionObj, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let txtChannel;
            try {
                txtChannel = (yield this.guild.createChannel("chat", "text", permissionObj));
                yield txtChannel.setParent(this.categoryChannel);
                return txtChannel;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createTextChannel: ${error}`);
                if (depth < 5)
                    return this.createTextChannel(permissionObj, depth + 1);
                else
                    return null;
            }
        });
    }
    createVoiceChannel(permissionObj, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let vChannel;
            try {
                vChannel = (yield this.guild.createChannel("Voice", "voice", permissionObj));
                yield vChannel.setParent(this.categoryChannel);
                return vChannel;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createVoiceChannel: ${error}`);
                if (vChannel)
                    vChannel.delete();
                if (depth < 5)
                    return this.createVoiceChannel(permissionObj, depth + 1);
                else
                    return null;
            }
        });
    }
    createSessionEndMessage(depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let msg;
            try {
                msg = (yield this.textChannel.send("🛑 End the session"));
                return msg;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createSessionMessage: ${error}`);
                if (msg)
                    msg.delete();
                if (depth < 5)
                    return this.createSessionEndMessage(depth + 1);
                else
                    return null;
            }
        });
    }
    createSessionInfoMessage(mu, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let msg;
            try {
                msg = (yield this.textChannel.send(utils_1.Utils.SessionToSessionEmbed(this, this.hostGuildMember.user, mu)));
                yield msg.pin();
                return msg;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createSessionMessage: ${error}`);
                if (msg)
                    msg.delete();
                if (depth < 5)
                    return this.createSessionInfoMessage(mu, depth + 1);
                else
                    return null;
            }
        });
    }
    createEndCollector(msg, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let endCollector;
            try {
                yield msg.react("🛑");
                endCollector = msg.createReactionCollector(m => { return m.emoji.name == "🛑"; });
                endCollector.on("collect", handleEndCollectorOn.bind(this));
                function handleEndCollectorOn(collected) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let modEnds = false;
                        for (let modID of main_1.data.permittedUsers.get(this.guild.id)) {
                            if (collected.users.has(modID))
                                modEnds = true;
                        }
                        if ((collected.users.has(this.hostID) || modEnds) && this.state == "running") {
                            main_1.sessionManager.endSession(this.id, modEnds && !collected.users.has(this.hostID));
                            endCollector.stop();
                        }
                    });
                }
                return endCollector;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createEndCollector: ${error}`);
                if (endCollector)
                    endCollector.stop();
                if (depth < 5)
                    return this.createEndCollector(msg, depth + 1);
                else
                    return null;
            }
        });
    }
    createMessages(author, mu) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let listingPreContent = `${this.hostGuildMember} is hosting a testingsession, testing ${this.mapTitle}.`;
                if (this.ping && Date.now() - mu.lastPing > Config.xpSettings.levels[0].pingcooldown * 60 * 60 * 1000) {
                    listingPreContent += ` @here\n_(if you want to mute pings, head to the bot-commands channel and use the ${Config.prefix}mute command)_`;
                    mu.lastPing = Date.now();
                    main_1.db.insertUser(mu);
                    this.listing.overwritePermissions(main_1.data.disableNotificationsRole.get(this.guild.id).id, { VIEW_CHANNEL: false, READ_MESSAGES: false });
                }
                let newListingPreMessage = yield this.createPreMessage(listingPreContent);
                this.listing.overwritePermissions(main_1.data.disableNotificationsRole.get(this.guild.id).id, { VIEW_CHANNEL: true, READ_MESSAGES: true });
                this.listing.overwritePermissions(this.guild.id, { VIEW_CHANNEL: true, READ_MESSAGES: true });
                this.sessionMessages.set("listingPre", newListingPreMessage);
                let newListingMessage = yield this.createListingMessage(author, mu);
                this.sessionMessages.set("listingEntry", newListingMessage);
                let newListingPostMessage = yield this.createPostMessage(author);
                this.sessionMessages.set("listingPost", newListingPostMessage);
                this.createJoinCollector(newListingPostMessage);
                let newSessionEndMessage = yield this.createSessionEndMessage();
                this.sessionMessages.set("sessionPre", newSessionEndMessage);
                this.createEndCollector(newSessionEndMessage);
                this.sessionMessages.set("sessionInfo", yield this.createSessionInfoMessage(mu));
                return true;
            }
            catch (error) {
                for (let m of this.sessionMessages) {
                    m[1].delete();
                }
                console.error(`[SESSION] [${this.id}] Error in createMessage: ${error}`);
                author.sendMessage("Something went wrong when creating the discord messages. Please try reloading the success page in your browser to restart the process.");
                return null;
            }
        });
    }
    createPreMessage(listingPreContent, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let newListingPreMessage = yield this.listing.send(listingPreContent);
                return newListingPreMessage;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createPreMessage: ${error}`);
                if (depth < 5)
                    return this.createPreMessage(listingPreContent, depth + 1);
                else
                    return null;
            }
        });
    }
    createListingMessage(author, mu, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let newListingMessage = yield this.listing.send(utils_1.Utils.SessionToListingEmbed(this, author));
                return newListingMessage;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createListingMessage: ${error}`);
                if (depth < 5)
                    return this.createListingMessage(author, mu, depth + 1);
                else
                    return null;
            }
        });
    }
    createPostMessage(author, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let newListingPostMessage = yield this.listing.send(`🌱 ${author} 🇭 created the session.`);
                return newListingPostMessage;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createPostMessage: ${error}`);
                if (depth < 5)
                    return this.createPostMessage(author, depth + 1);
                else
                    return null;
            }
        });
    }
    createJoinCollector(postMessage, depth = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //react
                yield postMessage.react(main_1.data.usedEmojis.get(this.guild.id).get("join"));
                //reaction collector
                let joinCollector = postMessage.createReactionCollector(m => { return m.emoji == main_1.data.usedEmojis.get(this.guild.id).get("join"); }, { time: 18000000 });
                joinCollector.on("collect", this.handleJoinCollectionOn.bind(this));
                return joinCollector;
            }
            catch (error) {
                console.error(`[SESSION] [${this.id}] Error in createJoinCollector: ${error}`);
                if (depth < 5)
                    return this.createJoinCollector(postMessage, depth + 1);
                else
                    return null;
            }
        });
    }
    handleJoinCollectionOn(collected) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let reactedUser of collected.users.values()) {
                if (reactedUser.id != main_1.client.user.id) {
                    //add users to session if they reacted
                    collected.remove(reactedUser);
                    let reactedGuildUser = yield this.guild.fetchMember(reactedUser.id);
                    let reacedMongoUser = yield main_1.db.getUser(reactedGuildUser.id);
                    //are they offline?
                    if (reactedGuildUser.presence.status == "offline") {
                        this.sessionMessages.get("listingPost").edit(`🔴 ${reactedGuildUser} you are marked as offline. Offline users can't join sessions.`);
                        return;
                    }
                    //did they set their username?
                    if ((!reacedMongoUser.mcJavaIGN && this.platform == "java") || (!reacedMongoUser.mcBedrockIGN && this.platform == "bedrock")) {
                        this.sessionMessages.get("listingPost").edit(`❓ ${reactedGuildUser} you don't have your username set for this platform. Please use ${Config.prefix}${register_js_1.register.name} in a bot channel first.`);
                        return;
                    }
                    //is session full?
                    if (this.role.members.size > this.maxParticipants) {
                        this.sessionMessages.get("listingPost").edit(`The session is full.`);
                        return;
                    }
                    //is user in a session already?
                    for (let ses of main_1.sessionManager.runningSessions.values()) {
                        if (reactedGuildUser.roles.has(ses.role.id)) {
                            this.sessionMessages.get("listingPost").edit(`❌ ${reactedGuildUser} you already are in a session.`);
                            return;
                        }
                    }
                    reactedGuildUser.addRole(this.role);
                    this.sessionMessages.get("listingPost").edit(`${main_1.data.usedEmojis.get(this.guild.id).get("joined")} ${reactedGuildUser} joined the session.`);
                    this.players.set(reactedGuildUser.id, { timestamp: Date.now(), user: reactedGuildUser });
                    //send message to session text channel
                    let mu = yield main_1.db.getUser(reactedUser.id);
                    this.sessionMessages.get("listingEntry").edit("", utils_1.Utils.SessionToListingEmbed(this, this.hostGuildMember.user));
                    this.textChannel.send(utils_1.Utils.JoinedEmbed(reactedGuildUser, mu, this.platform));
                }
            }
        });
    }
    endSession(byMod = false) {
        //TODO: set correct time text here & mention the possibility to !tip
        if (byMod)
            this.textChannel.send(`This session has been ended by a mod. This channel will be removed in 10 seconds.\nThank you for playing.\n${this.role}`);
        else
            this.textChannel.send(`This session has ended. This channel will self-destruct in 30 seconds.\nThis is the last chance for the host to use \`${Config.prefix}${tip_js_1.tip.name}\` for this session.\n\nThank you for playing and bye bye!\n${this.role}`);
        console.log(`[SESSION] [${this.id}] Ending`);
        this.state = "ending";
        for (let userInSession of this.players.values()) {
            utils_1.Utils.handleSessionLeavingUserXP(this, userInSession);
        }
        //remove session messages in listing
        this.sessionMessages.get("listingPre").delete();
        this.sessionMessages.get("listingEntry").delete();
        this.sessionMessages.get("listingPost").delete();
    }
    destroySession() {
        this.role.delete();
        setTimeout(this.voiceChannel.delete.bind(this.voiceChannel), 500);
        setTimeout(this.textChannel.delete.bind(this.textChannel), 1000);
        setTimeout(this.categoryChannel.delete.bind(this.categoryChannel), 1500);
    }
}
exports.Session = Session;
