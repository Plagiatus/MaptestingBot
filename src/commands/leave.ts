import { Command } from "./command";
import { Message, TextChannel } from "discord.js";
import { data, sessionManager } from "../main";

export let leave: Command = {
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
    execute: function leave(message: Message, args: string[]): boolean {
        if (!(<TextChannel>message.channel).parent.name.includes("session")) {
            message.reply(`How did you manage to run this command? Please tell an Admin about this! Error L1`);
            return true;
        }
        let sessionID: number = parseInt((<TextChannel>message.channel).parent.name.split("#")[1]);

        //is user host?
        for (let s of sessionManager.runningSessions) {
            if (s.id == sessionID && s.hostID == message.author.id) {
                message.reply(`you're the host of this session, you cannot leave it! If you want to end the session, use \`!stopsession\` instead.`);
                return true;
            }
        }

        //user is able to leave
        sessionManager.leaveSession(sessionManager.runningSessions.find(s => {return s.id == sessionID}), message.guild.members.get(message.author.id));

        message.delete();

        return true;
    }
}
