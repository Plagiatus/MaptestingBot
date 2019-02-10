import { Command, commands } from "./command";
import { Message } from "discord.js";
import { data } from "../main";

export let demote: Command = {
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
    execute: function (message: Message, args: string[]): boolean {

        if (message.mentions.users.size == 1) {
            if (data.demoteUser(message.guild.id, message.mentions.users.first().id)) {
                message.reply("you've successfully demoted " + message.mentions.users.first().username);
            } else {
                message.reply("something went wrong. couldn't demote user. maybe they aren't promoted?");
            }
        } else if (message.mentions.users.size == 0) {
            // let user: string = args.join(" ");
            // message.guild.members.forEach(m => {
            //     if (m.user.username + "#" + m.user.discriminator == user) {
            //         message.reply("you've successfully promoted " + m.user.username);
            //         return true;
            //     }
            // });
            message.reply("please provide a user")
        } else if (message.mentions.users.size > 1) {
            message.reply("you've mentioned too many users. One at a time please.")
        }
        return true;
    }
}
