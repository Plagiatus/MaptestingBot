import { Command } from "./command";
import { Message } from "discord.js";

// export ping: Command = {
//     execute = (message: Message, args?: any): boolean {
//         message.channel.send(`Pong! (Took ${Date.now() - message.createdTimestamp}ms)`);
//         return true;
//     }

// }

export let ping: Command = {
    name : "ping",
    aliases: ["p"],
    description: "Send a ping to the bot to check if and how fast it's responding.",
    usage: "",
    needsArgs: false,
    guildOnly: false,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden:false,
    channel: ["bot"],
    execute: function ping(message: Message, args: string[]): boolean{
        message.reply(`Pong! (Took ${Date.now() - message.createdTimestamp}ms)`);
        return true;
    }
}