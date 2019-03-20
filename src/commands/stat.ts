import { Command } from "./command";
import { Message, RichEmbed } from "discord.js";
import { MongoUser, Utils } from "../utils";
import { db } from "../main";

export let stat: Command = {
    name: "stat",
    aliases: ["me", "lvl", "level", "xp"],
    description: "Check out your own stats as they are saved on the server.",
    usage: "",
    globalCooldown: 0,
    individualCooldown: 3,
    guildOnly: true,
    grantedOnly: false,
    needsArgs: false,
    hidden: false,
    channel: ["bot"],
    execute: function stat(message: Message, args: string[]): boolean {
        db.getUser(message.author.id, message.author.username).then(callback);
        return true;

        function callback(mu: MongoUser) {
            if (!mu) return;
            let level: number = Utils.getLevelFromXP(mu.experience);
            let embed: RichEmbed = new RichEmbed()
                .setColor(Utils.getLevelColor(level))
                .setAuthor(message.author.username, message.author.avatarURL)
                .setThumbnail(`${Utils.getLevelImage(level)}`)
                .addField("Experience", mu.experience, true)
                .addField("Level", level, true)
                .addField("Sessions Hosted", mu.sessionsHosted, true)
                .addField("Sessions Joined", mu.sessionsJoined, true);
            message.channel.send(embed);
        }
    }
}
