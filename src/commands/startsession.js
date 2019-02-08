"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startsession = {
    name: "startsession",
    aliases: ["s", "startsession", "session", "testing", "testingsession"],
    description: "Start a testing session to playtest your map.",
    usage: "",
    needsArgs: false,
    guildOnly: false,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 10,
    hidden: false,
    execute: function ping(message, args) {
        message.reply(`Pong! (Took ${Date.now() - message.createdTimestamp}ms)`);
        return true;
    }
};
