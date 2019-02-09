"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tip = {
    name: "tip",
    aliases: [],
    description: "Send a player some of your hard earned experience as a thank you.",
    usage: "<amount>",
    needsArgs: true,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 0,
    hidden: false,
    channel: ["session"],
    execute: function ping(message, args) {
        //TODO: actually implement the tip command
        return true;
    }
};
