import { Message, Guild, RichEmbed, User, GuildMember, TextChannel, MessageEmbed } from "discord.js";
import { Command, commands } from "./commands/command";
import * as Config from "./config.json";
import { db, data, sessionManager } from "./main";

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

    public static getCategoryColor(category: string): string {
        for (let c in Config.sessionCategories) {
            if (c == category)
                return Config.sessionCategories[c].color;
        }
    }

    public static getPingCooldown(level: number): number {
        return Config.xpSettings.levels[level].pingcooldown * 60 * 60 * 1000;
    }

    public static getLevelImage(level: number): string {
        return Config.xpSettings.levels[level].img;
    }

    public static SessionToListingEmbed(session: TestingSession, author: User): RichEmbed {
        let version: string = session.platform == "java" ? "Minecraft: Java Edition " : "Minecraft: Bedrock"
        let emb: RichEmbed = new RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle("🌍 " + session.mapTitle)
            .setColor(this.getCategoryColor(session.category))
            .addField("💬 Description", session.mapDescription)
            .addBlankField();
        if (session.additionalInfo != "")
            emb.addField("ℹ️ Additional Info", session.additionalInfo);
        let testers: string = "noone yet";
        if (sessionManager.getRunningSession(session.id).players.size > 1) testers = "";
        for (let p of sessionManager.getRunningSession(session.id).players.values()) {
            if (p.user.id != session.hostID) {
                testers += `${p.user}\n`;
            }
        }
        emb.addField(`😃 Participants ${sessionManager.getRunningSession(session.id).players.size - 1}/${session.maxParticipants}`, testers, true)
            .addField(`🇭 Host`, `${author}`, true)
            .setThumbnail(Config.sessionCategories[session.category].img)
            .setFooter(`${version} ${session.platform == "java" ? session.version : ""}`);
        return emb;
    }

    public static SessionToSessionEmbed(session: TestingSession, author: User, mu: MongoUser): RichEmbed {

        let emb: RichEmbed = new RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle(session.mapTitle)
            .setColor(this.getCategoryColor(session.category))
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
            emb.addField("Java Username", `\`${mu.mcJavaIGN}\``, true);
        else
            emb.addField("Bedrock Username", `\`${mu.mcBedrockIGN}\``, true);
        emb.addField("Level", this.getLevelFromXP(mu.experience), true);

        return emb;
    }

    public static LeftEmbed(user: GuildMember, kicked: boolean = false): RichEmbed {
        let emb: RichEmbed = new RichEmbed()
            .setColor("#f44242");
        if (kicked) {
            emb.setTitle("Kicked from the session")
                .addField("Get out of here", `${data.usedEmojis.get(user.guild.id).get("left")} ${user} got kicked. :boot:`);
        } else {
            emb.setTitle("A tester left the session")
                .addField("Bye Bye", `${data.usedEmojis.get(user.guild.id).get("left")} ${user} left. :wave:`);
        }
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

    public static handleSessionLeavingUserXP(session: TestingSession, uis: UserInSession) {
        db.getUser(uis.user.id).then(mu => {
            let minutes = (Date.now() - uis.timestamp) / 60000;
            if (mu.discordID == session.hostID) {
                mu.hostedSessionsDuration += minutes;
                mu.sessionsHosted += 1;
                let level = Utils.getLevelFromXP(mu.experience);
                mu.experience += Utils.minutesToXP(minutes, "hosted");
                if (Utils.getLevelFromXP(mu.experience) > level) {
                    this.handleLevelup(mu, session.guild);
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
                    this.handleLevelup(mu, session.guild);
                }
                else {
                    db.insertUser(mu);
                }
            }
        });
    }

    public static setLevelRole(gm: GuildMember, level: number) {
        gm.removeRoles(Array.from(data.levelRoles.get(gm.guild.id).values())).then(() => {
            if (level > 0) {
                gm.addRole(data.levelRoles.get(gm.guild.id).get(level));
            }
        });
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
        for (let c of guild.channels.values()) {
            if (c.name.startsWith("bot") && c.type == "text") {
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

    public static getSessionFromUserId(_userID: string): TestingSession {
        for (let s of sessionManager.runningSessions) {
            if (s.players.has(_userID)) {
                return sessionManager.runningSessions.find(rs => {
                    return rs.id == s.id;
                });
            }
        }
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
    timestamp: number,
    user: GuildMember
}

export interface Report {
    uID: string;
    username: string,
    reasons: DateReason[]
}

export interface Kicks {
    uID: string;
    username: string;
    reasons: DateReason[];
}

interface DateReason {
    reporter: string;
    date: Date;
    reason: string;
}