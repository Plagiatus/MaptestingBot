"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
exports.stopsession = {
    name: "stopsession",
    aliases: ["stop", "st", "end", "endsession"],
    description: "End the session.",
    usage: "",
    needsArgs: false,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden: false,
    channel: ["session"],
    execute: function end(message, args) {
        if (!message.channel.parent.name.includes("session")) {
            message.reply(`How did you manage to run this command? Please tell an Admin about this!`);
            return true;
        }
        let sessionID = parseInt(message.channel.parent.name.split("#")[1]);
        for (let s of main_1.sessionManager.runningSessions) {
            if (s.id == sessionID && s.hostID == message.author.id) {
                main_1.sessionManager.endSession(s);
                return true;
            }
        }
        message.reply(`you're not the host of this session, you cannot end it.`).then(m => {
            m.delete(5000);
        });
        message.delete();
        return true;
    }
};
