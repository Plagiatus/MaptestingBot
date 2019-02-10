"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const utils_1 = require("../utils");
exports.addxp = {
    name: "addxp",
    aliases: [],
    description: "Add xp to a user. accepts negative values.",
    usage: "<user> <amount>",
    needsArgs: true,
    guildOnly: true,
    grantedOnly: true,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden: true,
    channel: ["bot"],
    execute: function addxp(message, args) {
        if (args.length < 2) {
            message.reply(`not enough arguments.`);
            return true;
        }
        if (message.mentions.members.size == 0) {
            message.reply("please mention a user as your first argument");
            return true;
        }
        let exp = parseInt(args[args.length - 1]);
        let gm = message.mentions.members.first();
        main_1.db.getUser(gm.id, mu => {
            if (!mu.experience)
                mu.experience = 0;
            mu.experience += exp;
            if (mu.experience < 0) {
                mu.experience = 0;
            }
            message.reply(`Set the xp level of ${gm.displayName} to ${mu.experience}.`);
            utils_1.Utils.setLevelRole(gm, utils_1.Utils.getLevelFromXP(mu.experience));
            main_1.db.insertUser(mu);
            return true;
        });
    }
};
