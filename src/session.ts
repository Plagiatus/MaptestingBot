import * as Discord from "discord.js";
import * as Config from "./config.json";
import { data, db, client, sessionManager } from "./main";
import { TestingSession, Utils, MongoUser, UserInSession } from "./utils";
import { mute } from "./commands/mute.js";
import { register } from "./commands/register.js";
import { createCipher } from "crypto";
import { tip } from "./commands/tip.js";

export type sessionMessageTypes = "listingPre" | "listingEntry" | "listingPost" | "sessionPre" | "sessionInfo";

export class Session implements TestingSession {
    id: number;
    hostID: string;
    setupTimestamp: number;
    startTimestamp: number;
    endTimestamp: number;
    platform: "java" | "bedrock";
    version: string;
    maxParticipants: number;
    mapTitle: string;
    mapDescription: string;
    additionalInfo: string;
    resourcepack: string;
    ip: string;
    category: "stream" | "minigame" | "adventure" | "datapack" | "other";
    state: "preparing" | "running" | "ending";
    guild: Discord.Guild;
    ping: boolean;

    listing: Discord.TextChannel;
    sessionMessages: Map<sessionMessageTypes, Discord.Message>;
    hostGuildMember: Discord.GuildMember;
    players: Map<string, UserInSession>;
    role: Discord.Role;
    categoryChannel: Discord.CategoryChannel;
    textChannel: Discord.TextChannel;
    voiceChannel: Discord.VoiceChannel;

    constructor(ts: TestingSession, listingChannel: Discord.TextChannel) {
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
        this.sessionMessages = new Map<sessionMessageTypes, Discord.Message>();
        // this.hostGuildMember = hostGuildMember;
        this.players = new Map<string, UserInSession>();
        console.log(`[SESSION] [${this.id}] created`);
    }

    public async start() {
        this.hostGuildMember = await this.guild.fetchMember(this.hostID);

        //add host as a player
        this.players.set(this.hostGuildMember.id, { timestamp: Date.now(), user: this.hostGuildMember });

        //save author
        let author: Discord.User = this.hostGuildMember.user;
        let mu: MongoUser = await db.getUser(author.id);

        if (!mu) {
            console.error(`[SESSION] [${this.id}] Couldn't get Mongo User`);
            author.send("Couldn't connect to database.");
            return null;
        }

        try {
            this.role = await this.createRole();
            await this.createChannels()
            this.createMessages(author, mu);
        } catch (error) {
            author.send("Couldn't set up the required roles, channels or messages.");
            this.role.delete();
            if (this.categoryChannel) setTimeout(this.categoryChannel.delete, 500);
            if (this.textChannel) setTimeout(this.textChannel.delete, 1000);
            if (this.voiceChannel) setTimeout(this.voiceChannel.delete, 1500);
            return null;
        }
    }



    private async createRole(depth: number = 0) {
        let newRole: Discord.Role;
        try {
            newRole = await this.guild.createRole({ name: `session-${this.id}`, color: "#C27C0E", mentionable: true, hoist: true });
            newRole.setPosition(data.levelRoles.get(this.guild.id).get(4).position + 1);
            await this.hostGuildMember.addRole(newRole);
            return newRole;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createRole: ${error}`);
            newRole.delete();
            if (depth < 5) return this.createRole(depth + 1);
            else return null;
        }
    }

    private async createChannels() {
        let permissionObj: Discord.ChannelCreationOverwrites[] = [
            {
                id: this.guild.id,
                deny: ["VIEW_CHANNEL", "READ_MESSAGES", "CONNECT", "SPEAK"]
            },
            {
                id: this.role.id,
                allow: ["VIEW_CHANNEL", "READ_MESSAGES", "CONNECT", "SPEAK"]
            },
            {
                id: client.user.id,
                allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL"]
            }
        ];

        //moderators should get automatic permission
        for (let i: number = 0; i < data.permittedRoles.get(this.guild.id).length; i++) {
            permissionObj.push({
                id: data.permittedRoles.get(this.guild.id)[i],
                allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS", "VIEW_CHANNEL", "CONNECT", "SPEAK"]
            });
        }

        try {
            this.categoryChannel = await this.createCategoryChannel(permissionObj);
            this.textChannel = await this.createTextChannel(permissionObj);
            this.voiceChannel = await this.createVoiceChannel(permissionObj);
        } catch (error) {

        }

    }

    private async createCategoryChannel(permissionObj: Discord.ChannelCreationOverwrites[], depth: number = 0) {
        let catChannel: Discord.CategoryChannel;
        try {
            catChannel = <Discord.CategoryChannel>await this.guild.createChannel(`session #${this.id}`, "category", permissionObj);
            catChannel.setPosition(this.listing.position - 1);
            return catChannel;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createCategoryChannel: ${error}`);
            if (catChannel) await catChannel.delete();
            if (depth < 5) return this.createCategoryChannel(permissionObj, depth + 1);
            else return null;
        }
    }

    private async createTextChannel(permissionObj: Discord.ChannelCreationOverwrites[], depth: number = 0) {
        let txtChannel: Discord.TextChannel;
        try {
            txtChannel = <Discord.TextChannel>await this.guild.createChannel("chat", "text", permissionObj);
            await txtChannel.setParent(this.categoryChannel);
            return txtChannel;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createTextChannel: ${error}`);
            if (depth < 5) return this.createTextChannel(permissionObj, depth + 1);
            else return null;
        }
    }

    private async createVoiceChannel(permissionObj: Discord.ChannelCreationOverwrites[], depth: number = 0) {
        let vChannel: Discord.VoiceChannel;
        try {
            vChannel = <Discord.VoiceChannel>await this.guild.createChannel("Voice", "voice", permissionObj);
            await vChannel.setParent(this.categoryChannel);
            return vChannel;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createVoiceChannel: ${error}`);
            if (vChannel) vChannel.delete();
            if (depth < 5) return this.createVoiceChannel(permissionObj, depth + 1);
            else return null;
        }
    }

    private async createSessionEndMessage(depth: number = 0) {
        let msg: Discord.Message;
        try {
            msg = <Discord.Message>await this.textChannel.send("🛑 End the session");
            return msg;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createSessionMessage: ${error}`);
            if (msg) msg.delete();
            if (depth < 5) return this.createSessionEndMessage(depth + 1);
            else return null;
        }
    }

    private async createSessionInfoMessage(mu: MongoUser, depth: number = 0) {
        let msg: Discord.Message;
        try {
            msg = <Discord.Message>await this.textChannel.send(Utils.SessionToSessionEmbed(this, this.hostGuildMember.user, mu));
            return msg;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createSessionMessage: ${error}`);
            if (msg) msg.delete();
            if (depth < 5) return this.createSessionInfoMessage(mu, depth + 1);
            else return null;
        }
    }

    private async createEndCollector(msg: Discord.Message, depth: number = 0) {
        let endCollector: Discord.ReactionCollector
        try {
            await msg.react("🛑");
            endCollector = msg.createReactionCollector(m => { return m.emoji.name == "🛑" });
            endCollector.on("collect", handleEndCollectorOn.bind(this));

            async function handleEndCollectorOn(collected: Discord.MessageReaction) {
                let modEnds: boolean = false;

                for (let modID of data.permittedUsers.get(this.guild.id)) {
                    if (collected.users.has(modID)) modEnds = true;
                }

                if ((collected.users.has(this.hostID) || modEnds) && this.state == "running") {
                    sessionManager.endSession(this, modEnds && !collected.users.has(this.hostID));
                    endCollector.stop();
                }
            }
            return endCollector;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createEndCollector: ${error}`);
            if (endCollector) endCollector.stop();
            if (depth < 5) return this.createEndCollector(msg, depth + 1);
            else return null;
        }
    }


    private async createMessages(author: Discord.User, mu: MongoUser) {
        try {
            let listingPreContent: string = `${this.hostGuildMember} ist hosting a testingsession, testing ${this.mapTitle}.`;
            if (this.ping && Date.now() - mu.lastPing > Config.xpSettings.levels[0].pingcooldown * 60 * 60 * 1000) {
                listingPreContent += ` @here\n_(if you want to mute pings, head to the bot-commands channel and use the ${Config.prefix}mute command)_`;
                mu.lastPing = Date.now();
                db.insertUser(mu);
                this.listing.overwritePermissions(data.disableNotificationsRole.get(this.guild.id).id, { VIEW_CHANNEL: false, READ_MESSAGES: false });
            }
            let newListingPreMessage: Discord.Message = await this.createPreMessage(listingPreContent);

            this.listing.overwritePermissions(data.disableNotificationsRole.get(this.guild.id).id, { VIEW_CHANNEL: true, READ_MESSAGES: true });
            this.listing.overwritePermissions(this.guild.id, { VIEW_CHANNEL: true, READ_MESSAGES: true });
            this.sessionMessages.set("listingPre", <Discord.Message>newListingPreMessage);

            let newListingMessage: Discord.Message = await this.createListingMessage(author, mu);
            this.sessionMessages.set("listingEntry", <Discord.Message>newListingMessage);

            let newListingPostMessage: Discord.Message = await this.createPostMessage(author);
            this.sessionMessages.set("listingPost", <Discord.Message>newListingPostMessage);

            this.createJoinCollector(newListingPostMessage);

            let newSessionEndMessage: Discord.Message = await this.createSessionEndMessage();
            this.sessionMessages.set("sessionPre", newSessionEndMessage);
            this.createEndCollector(newSessionEndMessage);

            this.sessionMessages.set("sessionInfo", await this.createSessionInfoMessage(mu));

            return true;
        } catch (error) {
            for (let m of this.sessionMessages) {
                m[1].delete();
            }
            console.error(`[SESSION] [${this.id}] Error in createMessage: ${error}`);
            author.sendMessage("Something went wrong when creating the discord messages. Please try reloading the success page in your browser to restart the process.");
            return null;
        }
    }

    private async createPreMessage(listingPreContent: string, depth: number = 0): Promise<Discord.Message> {
        try {
            let newListingPreMessage: Discord.Message = <Discord.Message>await this.listing.send(listingPreContent);
            return newListingPreMessage;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createPreMessage: ${error}`);
            if (depth < 5) return this.createPreMessage(listingPreContent, depth + 1);
            else return null;
        }
    }

    private async createListingMessage(author: Discord.User, mu: MongoUser, depth: number = 0): Promise<Discord.Message> {
        try {
            let newListingMessage: Discord.Message = <Discord.Message>await this.listing.send(Utils.SessionToListingEmbed(this, author, mu));
            return newListingMessage;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createListingMessage: ${error}`);
            if (depth < 5) return this.createListingMessage(author, mu, depth + 1);
            else return null;
        }
    }

    private async createPostMessage(author: Discord.User, depth: number = 0): Promise<Discord.Message> {
        try {
            let newListingPostMessage: Discord.Message = <Discord.Message>await this.listing.send(`🌱 ${author} 🇭 created the session.`);
            return newListingPostMessage;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createPostMessage: ${error}`);
            if (depth < 5) return this.createPostMessage(author, depth + 1);
            else return null;
        }
    }

    private async createJoinCollector(postMessage: Discord.Message, depth: number = 0) {
        try {
            //react
            await postMessage.react(data.usedEmojis.get(this.guild.id).get("join"));
            //reaction collector
            let joinCollector: Discord.ReactionCollector = postMessage.createReactionCollector(m => { return m.emoji == data.usedEmojis.get(this.guild.id).get("join") }, { time: 18000000 });
            joinCollector.on("collect", this.handleJoinCollectionOn.bind(this));
            return joinCollector;
        } catch (error) {
            console.error(`[SESSION] [${this.id}] Error in createJoinCollector: ${error}`);
            if (depth < 5) return this.createJoinCollector(postMessage, depth + 1);
            else return null;
        }
    }

    private async handleJoinCollectionOn(collected: Discord.MessageReaction) {
        for (let reactedUser of collected.users.values()) {
            if (reactedUser.id != client.user.id) {
                //add users to session if they reacted
                collected.remove(reactedUser);
                let reactedGuildUser: Discord.GuildMember = await this.guild.fetchMember(reactedUser.id);
                let reacedMongoUser: MongoUser = await db.getUser(reactedGuildUser.id);
                //are they offline?
                if (reactedGuildUser.presence.status == "offline") {
                    this.sessionMessages.get("listingPost").edit(`🔴 ${reactedGuildUser} you are marked as offline. Offline users can't join sessions.`);
                    return;
                }

                //did they set their username?
                if ((!reacedMongoUser.mcJavaIGN && this.platform == "java") || (!reacedMongoUser.mcBedrockIGN && this.platform == "bedrock")) {
                    this.sessionMessages.get("listingPost").edit(`❓ ${reactedGuildUser} you don't have your username set for this platform. Please use ${Config.prefix}${register.name} in a bot channel first.`);
                    return;
                }

                //is session full?
                if (this.role.members.size > this.maxParticipants) {
                    this.sessionMessages.get("listingPost").edit(`The session is full.`);
                    return;
                }
                //is user in a session already?
                for (let ses of sessionManager.runningSessions.values()) {
                    if (reactedGuildUser.roles.has(ses.role.id)) {
                        this.sessionMessages.get("listingPost").edit(`❌ ${reactedGuildUser} you already are in a session.`);
                        return;
                    }
                }
                reactedGuildUser.addRole(this.role);
                this.sessionMessages.get("listingPost").edit(`${data.usedEmojis.get(this.guild.id).get("joined")} ${reactedGuildUser} joined the session.`);
                this.players.set(reactedGuildUser.id, { timestamp: Date.now(), user: reactedGuildUser });

                //send message to session text channel

                let mu: MongoUser = await db.getUser(reactedUser.id);
                this.sessionMessages.get("listingEntry").edit("", Utils.SessionToListingEmbed(this, this.hostGuildMember.user, mu));
                this.textChannel.send(Utils.JoinedEmbed(reactedGuildUser, mu, this.platform));

            }
        }
    }

    endSession(byMod: boolean = false){
        
        //TODO: set correct time text here & mention the possibility to !tip
        if (byMod) this.textChannel.send(`This session has been ended by a mod. This channel will be removed in 10 seconds.\nThank you for playing.\n${this.role}`);
        else this.textChannel.send(`This session has ended. This channel will self-destruct in 30 seconds.\nThis is the last chance for the host to use \`${Config.prefix}${tip.name}\` for this session.\n\nThank you for playing and bye bye!\n${this.role}`);
        console.log(`[SESSION] [${this.id}] Ending`);
        this.state = "ending";

        for (let userInSession of this.players.values()) {
            Utils.handleSessionLeavingUserXP(this, userInSession);
        }


        //remove session messages in listing
        this.sessionMessages.get("listingPre").delete();
        this.sessionMessages.get("listingEntry").delete();
        this.sessionMessages.get("listingPost").delete();

    }

    destroySession(){
        setTimeout(this.voiceChannel.delete.bind(this.voiceChannel), 500);
        setTimeout(this.textChannel.delete.bind(this.textChannel), 1000);
        setTimeout(this.categoryChannel.delete.bind(this.categoryChannel), 1500);
    }
}