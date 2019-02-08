import { Message, RichEmbed } from "discord.js";
import { Command } from "./command";
import { MongoUser } from "../utils";
import * as Database from "../database";

export let test: Command = {
    name: "test",
    aliases: ["t"],
    description: "Just a test command.",
    usage: "<name>",
    globalCooldown: 0,
    individualCooldown: 0,
    guildOnly: true,
    needsArgs: false,
    execute: function test(message: Message, args: string[]): boolean {
        Database.getUser(message.author.id, callback);

        return true;

        function callback(mu: MongoUser) {
            if(!mu) return;
            mu.experience += 100;
            Database.insertUser(mu);
        }
    }

}



/////////////////// EMBEDS
// message.delete(5000);

// let embed:RichEmbed = new RichEmbed;
// embed.setAuthor(message.author.username, message.author.avatarURL)
// .setTitle("Map Name")
// .setColor("#123456")
// .attachFile("../img/stream.png")
// .setThumbnail("attachment://stream.png")
// .setDescription("asdfjö asökjf asf saö oaöksd asödjksldf aödj asöd asj asdj awj fosdjf aoj dkaöoid aodjf asoidj attachment://black_test.png ");
// message.channel.send(embed);



//////// PINGING USERS
// message.channel.send("args: " + args);
// if (command == "ping")
//     message.channel.send(`Pong! took ${Date.now() - message.createdTimestamp}ms`);
// else if (command == "kick") {
    //     // let taggedUser: Discord.User = message.mentions.users
    //     message.mentions.users.first().send(message.mentions.users.first().username + " what are you doinng???");
    // }
    // else if (command == "avatar"){
        //     message.reply(message.author.displayAvatarURL);
        // }
// message.channel.bulkDelete(5);