"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping = {
    name: "ping",
    aliases: ["p"],
    description: "Send a ping to the bot to check if and how fast it's responding.",
    usage: "",
    needsArgs: false,
    guildOnly: false,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden: false,
    channel: ["bot"],
    execute: function ping(message, args) {
        message.reply(`Pong! (Took ${Date.now() - message.createdTimestamp}ms)`);
        return true;
    }
};
