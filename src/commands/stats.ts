import { Database } from "../Database";
import { Command } from "./command";
import { Message, RichEmbed, Util } from "discord.js";
import { MongoUser, Utils } from "../utils";
import { db } from "../main";

export let stats: Command = {
    name: "stats",
    aliases: ["stat", "me", "lvl", "level"],
    description: "Check out your own stats as they are saved on the server.",
    usage: "",
    globalCooldown: 0,
    individualCooldown: 3,
    guildOnly: false,
    grantedOnly: false,
    needsArgs: false,
    hidden: false,
    execute: function test(message: Message, args: string[]): boolean {
        db.getUser(message.author.id, callback);
        return true;

        function callback(mu: MongoUser) {
            if (!mu) return;
            let level: number = Utils.getLevelFromXP(mu.experience);
            let embed: RichEmbed = new RichEmbed()
                .setColor(Utils.getLevelColor(level))
                .setAuthor(message.author.username, message.author.avatarURL)
                .attachFile(`../img/${Utils.getLevelImage(level)}`)
                .setThumbnail(`attachment://${Utils.getLevelImage(level)}`)
                .addField("Experience", mu.experience, true)
                .addField("Level", level, true)
                .addField("Sessions Hosted", mu.sessionsHosted, true)
                .addField("Sessions Joined", mu.sessionsJoined, true);
            message.channel.send(embed);
        }
    }
}
