import { Command } from "./command";
import { Message } from "discord.js";


export let tip: Command = {
    name : "tip",
    aliases: [],
    description: "Send a player some of your hard earned experience as a thank you.",
    usage: "<amount>",
    needsArgs: true,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 0,
    hidden:false,
    channel: ["session"],
    execute: function ping(message: Message, args: string[]): boolean{

        return true;
    }
}