import { Message } from "discord.js";
import { Command, commands } from "./command";
import { prefix } from "../config.json"
import { Utils } from "../utils";

export let help: Command = {
    name: "help",
    aliases: ["h", "info"],
    description: "Displays information about the available commands.",
    usage: "[command]",
    globalCooldown: 0,
    individualCooldown: 0,
    guildOnly: false,
    grantedOnly: false,
    hidden: false,
    needsArgs: false,
    execute: function test(message: Message, args: string[]): boolean {
        if (!args.length) {
            let response: string = "Available Commands:\n";
            for (let c of commands.values()) {
                if (!c.hidden)
                    response += `${c.name}, `
            }
            response += `\nFor detailed information, use ${prefix}${this.name} ${this.usage}.`
            message.reply(response);
        } else {
            let command: Command = Utils.findCommandWithAlias(args[0].toLowerCase());
            if (!command) {
                message.reply("that is not a valid command");
            } else {
                let response: string = `***${command.name}***\n------------\n${command.description}\n`;
                response += `_Usage:_ \`${prefix}${command.name} ${command.usage}\`\n`
                if (command.aliases.length > 0) {
                    response += `_Aliases:_ ${command.aliases}\n`;
                }
                message.channel.send(response);
            }
        }
        return true;
    }
}