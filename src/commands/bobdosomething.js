"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bobdosomething = void 0;
exports.bobdosomething = {
    name: "bobdosomething",
    aliases: ["bob!"],
    description: "How did you find this??",
    usage: "",
    globalCooldown: 0,
    individualCooldown: 0,
    guildOnly: true,
    grantedOnly: false,
    needsArgs: false,
    hidden: true,
    channel: ["bot"],
    execute: function test(message, args) {
        message.reply("your ult charge is too low! Kill some more Widowmakers.");
        return true;
    }
};
