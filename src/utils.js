"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("./commands/command");
const Config = require("./config.json");
const main_1 = require("./main");
class Utils {
    static removeMessage(message, delay = 0) {
        setTimeout(message.delete, delay);
    }
    static findCommandWithAlias(alias) {
        if (command_1.commands.has(alias))
            return command_1.commands.get(alias);
        for (let c of command_1.commands) {
            if (c[1].aliases.indexOf(alias) > -1)
                return c[1];
        }
        return null;
    }
    static getLevelFromXP(xp) {
        let level = 0;
        for (let i = 0; i < Config.xpSettings.levels.length; i++) {
            if (xp >= Config.xpSettings.levels[i].minXP) {
                level = i;
            }
        }
        return level;
    }
    static getLevelColor(level) {
        return Config.xpSettings.levels[level].color;
    }
    static getCategoryColor(category) {
        for (let c in Config.sessionCategories) {
            if (c == category)
                return Config.sessionCategories[c].color;
        }
    }
    static getPingCooldown(level) {
        return Config.xpSettings.levels[level].pingcooldown * 60 * 60 * 1000;
    }
    static getLevelImage(level) {
        return Config.xpSettings.levels[level].img;
    }
    static SessionToListingEmbed(session, author, mu) {
        let version = session.platform == "java" ? "Minecraft: Java Edition " : "Minecraft: Bedrock";
        let emb = new discord_js_1.RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle("🌍 " + session.mapTitle)
            .setColor(this.getCategoryColor(session.category))
            .addField("💬 Description", session.mapDescription)
            .addBlankField();
        if (session.additionalInfo != "")
            emb.addField("ℹ️ Additional Info", session.additionalInfo);
        let testers = "noone yet";
        if (main_1.sessionManager.sessionPlayers.get(session.id).size > 1)
            testers = "";
        for (let p of main_1.sessionManager.sessionPlayers.get(session.id).values()) {
            if (p.user.id != session.hostID) {
                testers += `${p.user}\n`;
            }
        }
        emb.addField(`😃 Participants ${main_1.sessionManager.sessionPlayers.get(session.id).size - 1}/${session.maxParticipants}`, testers, true)
            .addField(`🇭 Host`, `${author}`, true)
            .setThumbnail(Config.sessionCategories[session.category].img)
            .setFooter(`${version} ${session.platform == "java" ? session.version : ""}`);
        return emb;
    }
    static SessionToSessionEmbed(session, author, mu) {
        let emb = new discord_js_1.RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle(session.mapTitle)
            .setColor(this.getLevelColor(this.getLevelFromXP(mu.experience)))
            .addField("💬 Description", session.mapDescription);
        if (session.additionalInfo != "")
            emb.addField("ℹ️ Additional Info", session.additionalInfo);
        emb.addField("🌐 IP/Server", `\`${session.ip}\``, true);
        if (session.resourcepack != "")
            emb.addField("🗃️ Resourcepack", `[Download here](${session.resourcepack})`, true);
        let footer = "";
        if (session.platform == "java")
            footer += "Minecraft: Java Edition " + session.version;
        if (session.platform == "bedrock")
            footer += "Minecraft: Bedrock | The host probably needs to add you to their friends list";
        if (session.ip == "Realms")
            footer += " | This session is conducted on Minecraft Realms. The host needs to invite you for you to be able to join.";
        emb.setFooter(footer)
            .setThumbnail(Config.sessionCategories[session.category].img);
        return emb;
    }
    static JoinedEmbed(user, mu, type = "java") {
        let emb = new discord_js_1.RichEmbed()
            .setColor(this.getLevelColor(this.getLevelFromXP(mu.experience)))
            .setTitle("A tester joined the session")
            .addField("Welcome", `${main_1.data.usedEmojis.get(user.guild.id).get("joined")} ${user} joined.`);
        if (type == "java")
            emb.addField("Java Username", `\`${mu.mcJavaIGN}\``, true);
        else
            emb.addField("Bedrock Username", `\`${mu.mcBedrockIGN}\``, true);
        emb.addField("Level", this.getLevelFromXP(mu.experience), true);
        return emb;
    }
    static LeftEmbed(user, kicked = false) {
        let emb = new discord_js_1.RichEmbed()
            .setColor("#f44242");
        if (kicked) {
            emb.setTitle("Kicked from the session")
                .addField("Get out of here", `${main_1.data.usedEmojis.get(user.guild.id).get("left")} ${user} got kicked. :boot:`);
        }
        else {
            emb.setTitle("A tester left the session")
                .addField("Bye Bye", `${main_1.data.usedEmojis.get(user.guild.id).get("left")} ${user} left. :wave:`);
        }
        return emb;
    }
    static minutesToXP(minutes, hostedOrJoined) {
        let xp = 0;
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
    static handleSessionLeavingUserXP(session, uis) {
        main_1.db.getUser(uis.user.id, mu => {
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
                    main_1.db.insertUser(mu);
                }
            }
            else {
                mu.joinedSessionsDuration += minutes;
                mu.sessionsJoined += 1;
                let level = Utils.getLevelFromXP(mu.experience);
                mu.experience += Utils.minutesToXP(minutes, "joined");
                if (Utils.getLevelFromXP(mu.experience) > level) {
                    this.handleLevelup(mu, session.guild);
                }
                else {
                    main_1.db.insertUser(mu);
                }
            }
        });
    }
    static setLevelRole(gm, level) {
        gm.removeRoles(Array.from(main_1.data.levelRoles.get(gm.guild.id).values())).then(() => {
            if (level > 0) {
                gm.addRole(main_1.data.levelRoles.get(gm.guild.id).get(level));
            }
        });
    }
    static handleLevelup(mu, guild) {
        let newLvl = Utils.getLevelFromXP(mu.experience);
        let gMember = guild.members.get(mu.discordID);
        //reset ping cooldown as an additional reward
        mu.lastPing = 0;
        let emb = new discord_js_1.RichEmbed()
            .setAuthor(gMember.displayName, gMember.user.displayAvatarURL)
            .setTitle("LEVELUP!")
            .addField("Contratulations", `${guild.members.get(mu.discordID)} just reached Level ${newLvl}. ${Utils.getRandomCompliment()}`)
            .setColor(this.getLevelColor(newLvl));
        for (let c of guild.channels.values()) {
            if (c.name.startsWith("bot") && c.type == "text") {
                c.send(emb);
            }
        }
        this.setLevelRole(gMember, newLvl);
        main_1.db.insertUser(mu);
    }
    static getRandomCompliment() {
        let rand = Math.floor(Math.random() * 8);
        let comp = "";
        switch (rand) {
            case 0:
                comp = "Fancy.";
                break;
            case 1:
                comp = "Groovy.";
                break;
            case 2:
                comp = "Nice.";
                break;
            case 3:
                comp = "Round of applause.";
                break;
            case 4:
                comp = "Gogogo!";
                break;
            case 5:
                comp = "Bow before them.";
                break;
            case 6:
                comp = "Are you proud yet, dad?";
                break;
            case 7:
                comp = "Jealous much?";
                break;
            default:
                break;
        }
        return comp;
    }
    static getSessionFromUserId(_userID) {
        for (let [key, value] of main_1.sessionManager.sessionPlayers.entries()) {
            if (value.has(_userID)) {
                return main_1.sessionManager.runningSessions.find(rs => {
                    return rs.id == key;
                });
            }
        }
    }
}
exports.Utils = Utils;
