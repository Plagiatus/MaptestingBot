"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database = require("../Database");
const discord_js_1 = require("discord.js");
const utils_1 = require("../utils");
exports.stats = {
    name: "stats",
    aliases: ["stat", "me", "lvl", "level"],
    description: "Check out your own stats as they are saved on the server.",
    usage: "",
    globalCooldown: 0,
    individualCooldown: 3,
    guildOnly: false,
    needsArgs: false,
    execute: function test(message, args) {
        Database.getUser(message.author.id, callback);
        return true;
        function callback(mu) {
            console.log("callback", mu);
            if (!mu)
                return;
            let level = utils_1.Utils.getLevelFromXP(mu.experience);
            let embed = new discord_js_1.RichEmbed()
                .setColor(utils_1.Utils.getLevelColor(level))
                .setAuthor(message.author.username, message.author.avatarURL)
                .attachFile(`../img/${utils_1.Utils.getLevelImage(level)}`)
                .setThumbnail(`attachment://${utils_1.Utils.getLevelImage(level)}`)
                .addField("Experience", mu.experience, true)
                .addField("Level", level, true)
                .addField("Sessions Hosted", mu.sessionsHosted, true)
                .addField("Sessions Joined", mu.sessionsJoined, true);
            message.channel.send(embed);
        }
    }
};
