import { Message, Guild, RichEmbed, User, GuildMember, TextChannel } from "discord.js";
import { Command, commands } from "./commands/command";
import * as Config from "./config.json";
import { Database } from "./database";
import { db, data } from "./main";
import { MongoClient } from "mongodb";
import { Session } from "inspector";

export class Utils {
    public static removeMessage(message: Message, delay: number = 0) {
        setTimeout(message.delete, delay);
    }

    public static findCommandWithAlias(alias: string): Command {
        if (commands.has(alias)) return commands.get(alias);
        for (let c of commands) {
            if (c[1].aliases.indexOf(alias) > -1) return c[1];
        }
        return null;
    }

    public static getLevelFromXP(xp: number): number {
        let level: number = 0;
        for (let i: number = 0; i < Config.xpSettings.levels.length; i++) {
            if (xp >= Config.xpSettings.levels[i].minXP) {
                level = i;
            }
        }

        return level;
    }

    public static getLevelColor(level: number): string {
        return Config.xpSettings.levels[level].color;
    }

    public static getLevelImage(level: number): string {
        return Config.xpSettings.levels[level].img;
    }

    public static SessionToListingEmbed(session: TestingSession, author: User, mu: MongoUser): RichEmbed {
        let version: string = session.platform == "java" ? "Minecraft: Java Edition " : "Minecraft: Bedrock"
        let emb: RichEmbed = new RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle("🌍 " + session.mapTitle)
            .setColor(this.getLevelColor(this.getLevelFromXP(mu.experience)))
            .addField("💬 Description", session.mapDescription)
            .addBlankField();
        if (session.additionalInfo != "")
            emb.addField("ℹ️ Additional Info", session.additionalInfo);
        emb.addField(`😃 Participants 0/${session.maxParticipants}`, "noone yet", true)
            .addField(`🇭 Host`, `${author}`, true)
            .setThumbnail(Config.sessionCategories[session.category].img)
            .setFooter(`${version} ${session.platform == "java" ? session.version : ""}`);
        return emb;


    }

    public static SessionToSessionEmbed(session: TestingSession, author: User, mu: MongoUser): RichEmbed {

        let emb: RichEmbed = new RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle(session.mapTitle)
            .setColor(this.getLevelColor(this.getLevelFromXP(mu.experience)))
            .addField("💬 Description", session.mapDescription);
        if (session.additionalInfo != "")
            emb.addField("ℹ️ Additional Info", session.additionalInfo);

        emb.addField("🌐 IP/Server", `\`${session.ip}\``, true);
        if (session.resourcepack != "")
            emb.addField("🗃️ Resourcepack", `[Download here](${session.resourcepack})`, true);
        let footer: string = "";
        if (session.platform == "java")
            footer += "Minecraft: Java Edition " + session.version;
        if (session.platform == "bedrock")
            footer += "Minecraft: Bedrock | The host probably needs to add you to their friends list";
        if (session.ip == "Realms")
            footer += " | This session is conducted on Minecraft Realms. The host needs to invite you for you to be able to join.";
        emb.setFooter(footer)
            .setThumbnail(Config.sessionCategories[session.category].img)
        return emb;
    }

    public static JoinedEmbed(user: GuildMember, mu: MongoUser, type: "java" | "bedrock" = "java"): RichEmbed {
        let emb: RichEmbed = new RichEmbed()
            .setColor(this.getLevelColor(this.getLevelFromXP(mu.experience)))
            .setTitle("A tester joined the session")
            .addField("Welcome", `${data.usedEmojis.get(user.guild.id).get("joined")} ${user} joined.`);
        if (type == "java")
            emb.addField("Username", `\`${mu.mcJavaIGN}\``, true);
        else
            emb.addField("Username", `\`${mu.mcBedrockIGN}\``, true);
        emb.addField("Level", this.getLevelFromXP(mu.experience), true);

        return emb;
    }

    public static LeftEmbed(user: GuildMember): RichEmbed {
        let emb: RichEmbed = new RichEmbed()
            .setColor("#f44242")
            .setTitle("A tester left the session")
            .addField("Bye Bye", `${data.usedEmojis.get(user.guild.id).get("left")} ${user} left. :wave:`);
        return emb;
    }

    public static minutesToXP(minutes: number, hostedOrJoined: "hosted" | "joined"): number {
        let xp: number = 0;
        if (minutes < 10) {
            return xp;
        }
        minutes -= 10;
        if (hostedOrJoined == "hosted") {
            xp += Config.xpSettings.hostedSessions.xpfor10minutes;
            xp += minutes * Config.xpSettings.hostedSessions.additionalPerMinute;
        }
        if (hostedOrJoined == "joined") {
            xp += Config.xpSettings.joinedSessions.xpfor10minutes;
            xp += minutes * Config.xpSettings.joinedSessions.additionalPerMinute;
        }
        return Math.floor(xp);
    }

    public static handleSessionOverUserUpdates(session: TestingSession, uis: UserInSession) {
        db.getUser(uis.user.id, mu => {
            let minutes = (Date.now() - uis.joined) / 60000;
            if (mu.discordID == session.hostID) {
                mu.hostedSessionsDuration += minutes;
                mu.sessionsHosted += 1;
                let level = Utils.getLevelFromXP(mu.experience);
                mu.experience += Utils.minutesToXP(minutes, "hosted");
                if (Utils.getLevelFromXP(mu.experience) > level) {
                    this.handleLevelup(mu,session.guild);
                }
                else {
                    db.insertUser(mu);
                }
            } else {
                mu.joinedSessionsDuration += minutes;
                mu.sessionsJoined += 1;
                let level = Utils.getLevelFromXP(mu.experience);
                mu.experience += Utils.minutesToXP(minutes, "joined");
                if (Utils.getLevelFromXP(mu.experience) > level) {
                    this.handleLevelup(mu,session.guild);
                }
                else {
                    db.insertUser(mu);
                }
            }
        });
    }

    public static setLevelRole(gm: GuildMember, level: number){
        gm.removeRoles(Array.from(data.levelRoles.get(gm.guild.id).values()));
        gm.setRoles([data.levelRoles.get(gm.guild.id).get(level)]);
    }

    public static handleLevelup(mu: MongoUser, guild: Guild) {
        let newLvl: number = Utils.getLevelFromXP(mu.experience);
        let gMember: GuildMember = guild.members.get(mu.discordID);
        //reset ping cooldown as an additional reward
        mu.lastPing = 0;

        let emb: RichEmbed = new RichEmbed()
            .setAuthor(gMember.displayName, gMember.user.displayAvatarURL)
            .setTitle("LEVELUP!")
            .addField("Contratulations", `${guild.members.get(mu.discordID)} just reached Level ${newLvl}. ${Utils.getRandomCompliment()}`)
            .setColor(this.getLevelColor(newLvl));
        for(let c of guild.channels.values()){
            if(c.name.startsWith("bot") && c.type == "text"){
                (<TextChannel>c).send(emb);
            }
        }

        this.setLevelRole(gMember, newLvl);
        db.insertUser(mu);
    }

    public static getRandomCompliment(): string {
        let rand: number = Math.floor(Math.random() * 8);
        let comp: string = "";
        switch (rand) {
            case 0:
                comp = "Fancy."
                break;
            case 1:
                comp = "Groovy."
                break;
            case 2:
                comp = "Nice."
                break;
            case 3:
                comp = "Round of applause."
                break;
            case 4:
                comp = "Gogogo!"
                break;
            case 5:
                comp = "Bow before them."
                break;
            case 6:
                comp = "Are you proud yet, dad?"
                break;
            case 7:
                comp = "Jealous much?"
                break;

            default:
                break;
        }
        return comp;
    }
}

export interface MongoUser {
    discordID: string;
    experience: number;
    sessionsHosted: number;
    hostedSessionsDuration: number;
    sessionsJoined: number;
    joinedSessionsDuration: number;
    lastPing: number;
    mcJavaIGN: string;
    mcBedrockIGN: string;
    muted: number;
}

export interface TestingSession {
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
    guild: Guild;
    ping: boolean;
}

export interface UserInSession {
    joined: number,
    user: GuildMember
}
