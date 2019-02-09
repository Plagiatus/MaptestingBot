"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
const main_1 = require("../main");
exports.demote = {
    name: "demote",
    aliases: [],
    description: "demotes a user and removes special permissions.",
    globalCooldown: 0,
    individualCooldown: 60,
    grantedOnly: true,
    guildOnly: true,
    needsArgs: true,
    hidden: true,
    channel: ["bot"],
    usage: "<user>",
    execute: function (message, args) {
        if (message.mentions.users.size == 1) {
            if (main_1.data.demoteUser(message.guild.id, message.mentions.users.first().id)) {
                message.reply("you've successfully demoted " + message.mentions.users.first().username);
            }
            else {
                message.reply("something went wrong. couldn't demote user. maybe they aren't promoted?");
            }
        }
        else if (message.mentions.users.size == 0) {
            // let user: string = args.join(" ");
            // message.guild.members.forEach(m => {
            //     if (m.user.username + "#" + m.user.discriminator == user) {
            //         message.reply("you've successfully promoted " + m.user.username);
            //         return true;
            //     }
            // });
            message.reply("please provide a user");
        }
        else if (message.mentions.users.size > 1) {
            message.reply("you've mentioned too many users. One at a time please.");
        }
        return true;
    }
};
command_1.commands.set(exports.demote.name, exports.demote);
