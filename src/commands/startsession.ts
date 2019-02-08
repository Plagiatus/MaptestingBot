import { Command } from "./command";
import { Message } from "discord.js";

export let startsession: Command = {
    name : "startsession",
    aliases: ["s","startsession","session","testing","testingsession"],
    description: "Start a testing session to playtest your map.",
    usage: "",
    needsArgs: false,
    guildOnly: false,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 10,
    hidden:false,
    execute: function ping(message: Message, args: string[]): boolean{
        message.reply(`Pong! (Took ${Date.now() - message.createdTimestamp}ms)`);
        return true;
    }
}