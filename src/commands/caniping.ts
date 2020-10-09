import { Command } from "./command";
import { Message } from "discord.js";
import { db } from "../main";
import { Utils, MongoUser } from "../utils";

export let caniping: Command = {
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
    execute: function canIPing(message: Message, args: string[]): boolean {
        canIPingWithUser(message);
        return true;
    }
}

async function canIPingWithUser(message: Message) {
    let mu: MongoUser = await db.getUser(message.author.id, message.author.username);
    let timeLeft: number = Utils.getPingCooldown(Utils.getLevelFromXP(mu.experience)) - Date.now() + mu.lastPing;
    if (timeLeft < 0) {
        message.reply("you can ping at your next session.");
    } else if (timeLeft != Infinity){
        message.reply(`you can ping again in ${Math.floor(timeLeft / (60 * 60 * 1000))} hours and ${Math.floor(timeLeft / (60 * 1000) % 60)} minutes.`);
      } else {
        message.reply(`you can not ping until you've leveled up.`);
    }
}
