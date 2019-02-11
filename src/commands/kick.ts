import { Command } from "./command";
import { Message, TextChannel } from "discord.js";
import { data, db, sessionManager } from "../main";
import { stopsession } from "./stopsession";
import * as Config from "../config.json";
import { Utils } from "../utils";


export let kick: Command = {
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
    execute: function kick(message: Message, args: string[]): boolean {
        if (!(<TextChannel>message.channel).parent.name.includes("session")) {
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
            message.reply(`...did you really just try to kick yourself? What did you expect would happen?\n_if you want to end the session, use ${Config.prefix}${stopsession.name}_`)
            return false;
        }
        let sessionID: number = parseInt((<TextChannel>message.channel).parent.name.split("#")[1]);
        for (let s of data.runningSessions) {
            if (s.id == sessionID && s.hostID == message.author.id) {
                if (sessionManager.sessionPlayers.get(sessionID).has(message.mentions.members.first().id)) {
                    args.shift();
                    let reason: string = args.join(" ");
                    sessionManager.leaveSession(data.runningSessions.find(s => {return s.id == sessionID}), message.mentions.members.first(), true);
                    db.kick(message.author, message.mentions.members.first().user, reason);
                    return true;
                } else {
                    message.reply(`you cannot kick someone who isn't even in here.`);
                    return false;
                }
            }
        }
        message.reply(`you're not the host of this session, you cannot kick people from it.`).then(
            m => {
                (<Message>m).delete(5000);
            }
        );
        message.delete();
        return true;
    }
}