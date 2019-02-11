import { Message, TextChannel, CategoryChannel } from "discord.js";
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
    channel: ["bot", "session"],
    execute: function test(message: Message, args: string[]): boolean {

        if (!args.length) {
            if (message.channel.type == "text") {
                let response: string = "Available Commands in this channel:\n";
                for (let c of commands.values()) {
                    if (!c.hidden)
                        if ((<TextChannel>message.channel).parent.name.startsWith("session") && c.channel.some(v => { return v == "session" }))
                            response += `${c.name}, `
                        else if (!(<TextChannel>message.channel).parent.name.startsWith("session") && c.channel.some(v => { return v != "session" }))
                            response += `${c.name}, `
                }
                response += `\nFor detailed information, use ${prefix}${this.name} ${this.usage}.`
                message.reply(response);
            } else {
                let response: string = "Available Commands in this channel:\n";
                for (let c of commands.values()) {
                    if (!c.hidden)
                        if (!c.guildOnly)
                            response += `${c.name}, `;
                }
                response += `\nFor detailed information, use ${prefix}${this.name} ${this.usage}.`
                message.reply(response);
            }
        } else {
            let command: Command = Utils.findCommandWithAlias(args[0].toLowerCase());
            if (!command) {
                message.reply("that is not a valid command").then(m => {
                    (<Message>m).delete(5000);
                    message.delete(5000);
                })
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
