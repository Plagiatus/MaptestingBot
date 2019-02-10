"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("./commands/command");
const Config = require("./config.json");
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
    static getLevelImage(level) {
        return Config.xpSettings.levels[level].img;
    }
    static SessionToListingEmbed(session, author, mu) {
        let version = session.platform == "java" ? "Minecraft: Java Edition " : "Minecraft: Bedrock";
        let emb = new discord_js_1.RichEmbed()
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
            .setFooter(`${version} ${session.version}`);
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
            footer += "Minecraft: Bedrock";
        if (session.ip == "Realms")
            footer += " | This session is conducted on Minecraft Realms. The host needs to invite you for you to be able to join.";
        emb.setFooter(footer)
            .setThumbnail(Config.sessionCategories[session.category].img);
        return emb;
    }
}
exports.Utils = Utils;
