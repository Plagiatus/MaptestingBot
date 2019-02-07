"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    needsArgs: false,
    execute: function test(message, args) {
        if (!args.length) {
            let response = "Available Commands:\n";
            for (let c of command_1.commands.values()) {
                response += `${c.name}, `;
            }
            response += `\nFor detailed information, use ${config_json_1.prefix}${this.name} ${this.usage}.`;
            message.reply(response);
        }
        else {
            let command = utils_1.Utils.findCommandWithAlias(args[0].toLowerCase());
            if (!command) {
                message.reply("that is not a valid command");
            }
            else {
                let response = `***${command.name}***\n------------\n${command.description}\n`;
                response += `_Usage:_ ${config_json_1.prefix}${command.name} ${command.usage}\n`;
                if (command.aliases.length > 0) {
                    response += `_Aliases:_ ${command.aliases}\n`;
                }
                message.channel.send(response);
            }
        }
        return true;
    }
};
