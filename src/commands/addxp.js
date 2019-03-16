"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        addXPToMember(message, gm, exp);
        return true;
    }
};
function addXPToMember(message, gm, exp) {
    return __awaiter(this, void 0, void 0, function* () {
        let mu = yield main_1.db.getUser(gm.id);
        if (!mu.experience)
            mu.experience = 0;
        mu.experience += exp;
        if (mu.experience < 0) {
            mu.experience = 0;
        }
        message.reply(`Set the xp level of ${gm.displayName} to ${mu.experience}.`).then(() => {
            utils_1.Utils.setLevelRole(gm, utils_1.Utils.getLevelFromXP(mu.experience));
            main_1.db.insertUser(mu);
        });
    });
}
