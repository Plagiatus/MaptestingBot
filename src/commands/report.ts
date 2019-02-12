import { Command } from "./command";
import { Message } from "discord.js";
import { db } from "../main";


export let report: Command = {
    name : "report",
    aliases: [],
    description: "Report a player to the admins. _**Not to be used for immediate action, ping the mods instead if you need immediate action!!**_ ",
    usage: "<user> <reason>",
    needsArgs: true,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 30,
    hidden:false,
    channel: ["bot","session"],
    execute: function report(message: Message, args: string[]): boolean{
        if(message.mentions.users.size != 1){
            message.delete();
            message.reply("you didn't provide the correct amount of users in your message. One user at a time please.")
            return false;
        }
        args.shift();
        let reason: string = args.join(" ");
        db.report(message.author, message.mentions.users.first(), reason);
        message.reply("thank you, your report has been recieved.")
        message.delete();
        return true;
    }
}