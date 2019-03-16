"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const Config = require("../config.json");
exports.leave = {
    name: "leave",
    aliases: ["l"],
    description: "Leave the current testing session.",
    usage: "",
    needsArgs: false,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden: false,
    channel: ["session"],
    execute: function leave(message, args) {
        if (!message.channel.parent.name.includes("session")) {
            message.reply(`How did you manage to run this command? Please tell an Admin about this! Error L1`);
            return true;
        }
        let sessionID = parseInt(message.channel.parent.name.split("#")[1]);
        //is user host?
        for (let s of main_1.sessionManager.runningSessions) {
            if (s.id == sessionID && s.hostID == message.author.id) {
                message.reply(`you're the host of this session, you cannot leave it! If you want to end the session, use \`${Config.prefix}stopsession\` instead.`);
                return true;
            }
        }
        //user is able to leave
        main_1.sessionManager.leaveSession(sessionID, message.guild.members.get(message.author.id));
        message.delete();
        return true;
    }
};
