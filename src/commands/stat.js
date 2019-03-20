"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../utils");
const main_1 = require("../main");
exports.stat = {
    name: "stat",
    aliases: ["me", "lvl", "level", "xp"],
    description: "Check out your own stats as they are saved on the server.",
    usage: "",
    globalCooldown: 0,
    individualCooldown: 3,
    guildOnly: true,
    grantedOnly: false,
    needsArgs: false,
    hidden: false,
    channel: ["bot"],
    execute: function stat(message, args) {
        main_1.db.getUser(message.author.id, message.author.username).then(callback);
        return true;
        function callback(mu) {
            if (!mu)
                return;
            let level = utils_1.Utils.getLevelFromXP(mu.experience);
            let embed = new discord_js_1.RichEmbed()
                .setColor(utils_1.Utils.getLevelColor(level))
                .setAuthor(message.author.username, message.author.avatarURL)
                .setThumbnail(`${utils_1.Utils.getLevelImage(level)}`)
                .addField("Experience", mu.experience, true)
                .addField("Level", level, true)
                .addField("Sessions Hosted", mu.sessionsHosted, true)
                .addField("Sessions Joined", mu.sessionsJoined, true);
            message.channel.send(embed);
        }
    }
};
