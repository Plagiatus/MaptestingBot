import { Command} from "./command";
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
    execute: function mute(message: Message, args: string[]): boolean {
        let guildMember: GuildMember = message.guild.members.get(message.author.id);
        let disableRole: Role = data.disableNotificationsRole.get(message.guild.id);
        if (!guildMember.roles.has(disableRole.id)) {
            guildMember.addRole(disableRole.id);
            message.reply(`you have been muted.`);
            db.getUser(message.author.id, message.author.username).then(mu => {
                mu.muted = Date.now();
                db.insertUser(mu);
            });
        } else {
            guildMember.removeRole(disableRole.id);
            message.reply(`you have been un-muted.`);
        }
        return true;
    }
}
