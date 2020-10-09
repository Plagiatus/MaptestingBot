"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const utils_1 = require("../utils");
exports.caniping = {
    name: "caniping",
    aliases: ["cip"],
    description: "Allows you to check if (and if not, when) you can ping the next time.",
    usage: "",
    needsArgs: false,
    guildOnly: false,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden: false,
    channel: ["bot"],
    execute: function canIPing(message, args) {
        canIPingWithUser(message);
        return true;
    }
};
function canIPingWithUser(message) {
    return __awaiter(this, void 0, void 0, function* () {
        let mu = yield main_1.db.getUser(message.author.id, message.author.username);
        let timeLeft = utils_1.Utils.getPingCooldown(utils_1.Utils.getLevelFromXP(mu.experience)) - Date.now() + mu.lastPing;
        if (timeLeft < 0) {
            message.reply("you can ping at your next session.");
        }
        else if (timeLeft != Infinity) {
            message.reply(`you can ping again in ${Math.floor(timeLeft / (60 * 60 * 1000))} hours and ${Math.floor(timeLeft / (60 * 1000) % 60)} minutes.`);
        }
        else {
            message.reply(`you can not ping until you've leveled up.`);
        }
    });
}
