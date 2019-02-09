"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
const main_1 = require("../main");
exports.promote = {
    name: "promote",
    aliases: [],
    description: "promotes a user. enables special permissions. use with caution!",
    globalCooldown: 0,
    individualCooldown: 60,
    grantedOnly: true,
    guildOnly: true,
    needsArgs: true,
    usage: "<user>",
    hidden: true,
    channel: ["bot"],
    execute: function (message, args) {
        if (message.mentions.users.size == 1) {
            if (main_1.data.promoteUser(message.guild.id, message.mentions.users.first().id)) {
                message.reply("you've successfully promoted " + message.mentions.users.first().username);
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
command_1.commands.set(exports.promote.name, exports.promote);
