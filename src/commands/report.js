"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.report = void 0;
const main_1 = require("../main");
exports.report = {
    name: "report",
    aliases: [],
    description: "Report a player to the admins. _**Not to be used for immediate action, ping the mods instead if you need immediate action!!**_ ",
    usage: "<user> <reason>",
    needsArgs: true,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 30,
    hidden: false,
    channel: ["bot", "session"],
    execute: function report(message, args) {
        if (message.mentions.users.size != 1) {
            message.delete();
            message.reply("you didn't provide the correct amount of users in your message. One user at a time please.");
            return false;
        }
        args.shift();
        let reason = args.join(" ");
        main_1.db.report(message.author, message.mentions.users.first(), reason);
        message.reply("thank you, your report has been received.");
        message.delete();
        return true;
    }
};
