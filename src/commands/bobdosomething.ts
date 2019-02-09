import { Command, commands } from "./command";
import { Message } from "discord.js";

export let bobdosomething: Command = {
    name: "bobdosomething",
    aliases: ["bob!"],
    description: "How did you find this??",
    usage: "",
    globalCooldown: 0,
    individualCooldown: 0,
    guildOnly: true,
    grantedOnly: false,
    needsArgs: false,
    hidden: true,
    channel: ["bot"],
    execute: function test(message: Message, args: string[]): boolean {
        message.reply("your ult charge is too low! Kill some more Widowmakers.");
        return true;
    }
}

commands.set(bobdosomething.name, bobdosomething);