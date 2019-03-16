import { Command } from "./command";
import { Message, GuildMember } from "discord.js";
import { db } from "../main";
import { Utils, MongoUser } from "../utils";

export let addxp: Command = {
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
    execute: function addxp(message: Message, args: string[]): boolean {
        if (args.length < 2) {
            message.reply(`not enough arguments.`);
            return true;
        }
        if (message.mentions.members.size == 0) {
            message.reply("please mention a user as your first argument");
            return true;
        }
        let exp: number = parseInt(args[args.length - 1]);
        let gm: GuildMember = message.mentions.members.first();
        addXPToMember(message, gm, exp);
        return true;
    }
}

async function addXPToMember(message: Message, gm: GuildMember, exp: number) {
    let mu: MongoUser = await db.getUser(gm.id);
    if (!mu.experience) mu.experience = 0;
    mu.experience += exp;
    if (mu.experience < 0) {
        mu.experience = 0;
    }
    message.reply(`Set the xp level of ${gm.displayName} to ${mu.experience}.`).then(() => {
        Utils.setLevelRole(gm, Utils.getLevelFromXP(mu.experience));
        db.insertUser(mu);
    });
} 
