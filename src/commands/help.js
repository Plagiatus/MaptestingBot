"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = void 0;
const discord_js_1 = require("discord.js");
const command_1 = require("./command");
const config_json_1 = require("../config.json");
const utils_1 = require("../utils");
exports.help = {
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
    execute: function test(message, args) {
        //TODO: make into embed maybe
        if (!args.length) {
            if (message.channel.type == "text") {
                let response = "";
                for (let c of command_1.commands.values()) {
                    if (!c.hidden)
                        if (message.channel.parent.name.startsWith("session") && c.channel.some(v => { return v == "session"; }))
                            response += `${c.name}, `;
                        else if (!message.channel.parent.name.startsWith("session") && c.channel.some(v => { return v != "session"; }))
                            response += `${c.name}, `;
                }
                response += `\nFor detailed information, use ${config_json_1.prefix}${this.name} ${this.usage}.`;
                let emb = new discord_js_1.RichEmbed().addField("Available Commands in this channel:", response);
                message.channel.send(emb);
            }
            else {
                let response = "";
                for (let c of command_1.commands.values()) {
                    if (!c.hidden)
                        if (!c.guildOnly)
                            response += `${c.name}, `;
                }
                response += `\nFor detailed information, use ${config_json_1.prefix}${this.name} ${this.usage}.`;
                let emb = new discord_js_1.RichEmbed().addField("Available Commands in this channel", response);
                message.channel.send(emb);
            }
        }
        else {
            let command = utils_1.Utils.findCommandWithAlias(args[0].toLowerCase());
            if (!command) {
                message.reply("that is not a valid command").then(m => {
                    m.delete(5000);
                    message.delete(5000);
                });
            }
            else {
                let response = `${command.description}\n`;
                response += `_Usage:_ \`${config_json_1.prefix}${command.name} ${command.usage}\`\n`;
                if (command.aliases.length > 0) {
                    response += `_Aliases:_ ${command.aliases}\n`;
                }
                let emb = new discord_js_1.RichEmbed().addField(command.name, response);
                message.channel.send(emb);
            }
        }
        return true;
    }
};
