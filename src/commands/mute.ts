import { Command, commands } from "./command";
import { Message, GuildMember, Role } from "discord.js";
import { data, db } from "../main";

export let mute: Command = {
    name: "mute",
    aliases: [],
    description: "Mute or unmute the pings of the sessions.",
    usage: "",
    needsArgs: false,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden: false,
    channel: ["bot"],
    execute: function ping(message: Message, args: string[]): boolean {
        let guildMember: GuildMember = message.guild.members.get(message.author.id);
        let disableRole: Role = data.disableNotificationsRole.get(message.guild.id);
        if (guildMember.roles.has(disableRole.id)) {
            guildMember.addRole(disableRole);
            message.reply(`you have been un-muted.`);
        } else {
            guildMember.removeRole(disableRole);
            message.reply(`you have been muted.`);
            db.getUser(message.author.id, mu => {
                mu.muted = Date.now();
                db.insertUser(mu);
            });
        }
        return true;
    }
}
