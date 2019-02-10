"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const utils_1 = require("../utils");
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
        for (let s of main_1.data.runningSessions) {
            if (s.id == sessionID && s.hostID == message.author.id) {
                message.reply(`you're the host of this session, you cannot leave it! If you want to end the session, use \`!stopsession\` instead.`);
                return true;
            }
        }
        //user is able to leave
        message.channel.send(utils_1.Utils.LeftEmbed(message.guild.members.get(message.author.id)));
        message.guild.members.get(message.author.id).removeRole(main_1.sessionManager.sessionRoles.get(sessionID));
        message.delete();
        // console.log((Date.now() - sessionManager.sessionPlayers.get(sessionID).get(message.author.id).joined) / 1000, "seconds");
        utils_1.Utils.handleSessionOverUserUpdates(main_1.data.runningSessions.find((s) => { return s.id == sessionID; }), main_1.sessionManager.sessionPlayers.get(sessionID).get(message.author.id));
        main_1.sessionManager.sessionPlayers.get(sessionID).delete(message.author.id);
        return true;
    }
};
