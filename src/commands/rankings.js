"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Config = require("../config.json");
exports.rankings = {
    name: "ranking",
    aliases: ["lvls", "levels", "rankings", "list"],
    description: "Check out everyones stats.",
    usage: "",
    globalCooldown: 0,
    individualCooldown: 3,
    guildOnly: false,
    grantedOnly: false,
    needsArgs: false,
    hidden: false,
    channel: ["bot"],
    execute: function rankings(message, args) {
        let embed = new discord_js_1.RichEmbed()
            .addField("Listing of all players", `[Click here](http://${Config.ip}:8100/?view=list)`);
        message.channel.send(embed);
        return true;
    }
};
