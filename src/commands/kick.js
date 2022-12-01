"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kick = void 0;
const main_1 = require("../main");
const stopsession_1 = require("./stopsession");
const Config = require("../config.json");
exports.kick = {
    name: "kick",
    aliases: [],
    description: "Kick a player from a session. Needs to provide a reason.",
    usage: "<user> <reason>",
    needsArgs: true,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 20,
    hidden: false,
    channel: ["session"],
    execute: function kick(message, args) {
        //TODO: Make it so a kicked player can't rejoin the session
        if (!message.channel.parent.name.includes("session")) {
            message.reply(`How did you manage to run this command? Please tell an Admin about this!`);
            return false;
        }
        if (args.length < 2) {
            message.reply("not enough arguments. please provide a reason.");
            return false;
        }
        if (message.mentions.members.size != 1) {
            message.reply("you didn't provide the correct amount of users in your message. one user at a time please.");
            return false;
        }
        if (message.mentions.users.first() == message.author) {
            message.reply(`...did you really just try to kick yourself? What did you expect would happen?\n_if you want to end the session, use ${Config.prefix}${stopsession_1.stopsession.name}_`);
            return false;
        }
        let sessionID = parseInt(message.channel.parent.name.split("#")[1]);
        for (let s of main_1.sessionManager.runningSessions) {
            if (s.id == sessionID && s.hostID == message.author.id) {
                if (s.players.has(message.mentions.members.first().id)) {
                    args.shift();
                    let reason = args.join(" ");
                    main_1.sessionManager.leaveSession(s.id, message.mentions.members.first(), true);
                    main_1.db.kick(message.author, message.mentions.members.first().user, reason);
                    return true;
                }
                else {
                    message.reply(`you cannot kick someone who isn't even in here.`);
                    return false;
                }
            }
        }
        message.reply(`you're not the host of this session, you cannot kick people from it.`).then(m => {
            m.delete(5000);
        });
        message.delete();
        return true;
    }
};
