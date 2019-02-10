"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
exports.mute = {
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
    execute: function ping(message, args) {
        let guildMember = message.guild.members.get(message.author.id);
        let disableRole = main_1.data.disableNotificationsRole.get(message.guild.id);
        if (guildMember.roles.has(disableRole.id)) {
            guildMember.addRole(disableRole);
            message.reply(`you have been un-muted.`);
        }
        else {
            guildMember.removeRole(disableRole);
            message.reply(`you have been muted.`);
            main_1.db.getUser(message.author.id, mu => {
                mu.muted = Date.now();
                main_1.db.insertUser(mu);
            });
        }
        return true;
    }
};
