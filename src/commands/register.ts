import { Command, commands } from "./command";
import { Message } from "discord.js";
import * as Config from "./config.json";
import { db, sessionManager, data } from "../main";
import { MongoUser } from "../utils";

export let register: Command = {
    name: "register",
    aliases: ["reg"],
    description: "Register your username so you can join a session.",
    usage: "<Java|Bedrock> <Username>",
    needsArgs: true,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden: false,
    channel: ["bot"],
    execute: function ping(message: Message, args: string[]): boolean {
        if (args.length > 2) {
            message.reply(`not enough arguments. Usage: ${Config.prefix}${register.name} ${register.usage}`);
            return true;
        }
        let platform: string = args.shift().toLowerCase();
        if (platform != "java" && platform != "bedrock") {
            message.reply(`the first argument must be either "Java" or "Bedrock".`);
            return true;
        }
        let username: string = args.join(" ");
        db.getUser(message.author.id, (mu: MongoUser) => {
            if (platform == "java") {
                mu.mcJavaIGN = username;
                db.insertUser(mu);
                message.reply(`thank you. Set your Java Username to \`${username}\``);
                return true;
            }
            else if (platform == "bedrock") {
                mu.mcBedrockIGN = username;
                db.insertUser(mu);
                message.reply(`thank you. Set your Bedrock Username to \`${username}\``);
                return true;
            }
            message.reply("How did you manage to end up with this message? Please tell an Admin about this. Error: REG1");
        });

        return true;
    }
}
