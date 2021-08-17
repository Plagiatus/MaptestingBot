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
const Discord = require("discord.js");
const data_1 = require("./data");
// import { findCommandWithAlias, timeoutToPromise } from "./util";
const data = new data_1.Data();
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
client.once("ready", () => {
    console.log("[Discord] Ready.");
    client.application.fetch();
});
client.on("messageCreate", handleMessage);
// client.on("rateLimit", handleRateLimiting);
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand())
        return;
    if (interaction.commandName === "pingi") {
        yield interaction.deferReply({ ephemeral: true });
        setTimeout(() => {
            interaction.editReply({ content: "pong" });
        }, 4000);
    }
}));
client.login(data.secretConfig.token);
function handleMessage(message) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (message.content.toLowerCase() === ".d" && message.author.id === client.application.owner.id) {
            const data = {
                name: "echo",
                description: "replies with your input",
                options: [
                    {
                        name: "input",
                        type: "STRING",
                        description: "The input to echo back",
                        required: true
                    }
                ]
            };
            const command = yield ((_a = client.guilds.cache.get(message.guildId)) === null || _a === void 0 ? void 0 : _a.commands.create(data));
            // console.log(command);
        }
    });
}
// async function handleMessage(message: Discord.Message) {
// 	if (!message.content.startsWith(data.config.prefix) || message.author.bot) return;
// 	// console.log(message);
// 	let args: string[] = message.content.slice(data.config.prefix.length).split(/ +/);
// 	let commandName: string = args.shift().toLowerCase();
// 	let command: Command = findCommandWithAlias(commandName);
// 	if (await canCommandBeRun(command, args, message)) {
// 		try {
// 			command.execute(message, args);
// 		} catch (error) {
// 			message.reply("Something went wrong while executing that command: " + error);
// 			message.channel.send("If this problem persists, ping @Plagiatus.");
// 		}
// 	}
// }
// test();
// async function test(){
// 	console.log("1");
// 	await timeoutToPromise(1000, ()=>{});
// 	console.log("2");
// }
// console.log(data.config);
// async function canCommandBeRun(command: Command, args: string[], message: Discord.Message): Promise<boolean> {
// 	//does it exist?
// 	if (!command) {
// 		let newMessage: Discord.Message = await message.reply("The command you're trying to execute doesn't exist.");
// 		if (newMessage.deletable) newMessage.delete({ timeout: 5000 });
// 		if (message.deletable) message.delete();
// 		return false;
// 	}
// 	//dm?
// 	if (message.channel.type != "text" && command.guildOnly) {
// 		message.reply("This command can only be executed in the respective server channel.")
// 		return false;
// 	}
// 	//channel type
// 	if (message.channel.type == "text" && !command.channel.includes("all")) {
// 		let channeltype: ("nonsession" | "session" | "bot") = "nonsession";
// 		let channel = message.channel as Discord.TextChannel;
// 		if (channel.name.startsWith("bot")) {
// 			channeltype = "bot";
// 		} else if (channel.parent && channel.parent.name.startsWith("session")) {
// 			channeltype = "session";
// 		}
// 		if (!command.channel.includes(channeltype)) {
// 			let newMessage: Discord.Message = await message.reply("This command can only be executed in the following channeltypes: " + command.channel);
// 			if (newMessage.deletable) newMessage.delete({ timeout: 5000 });
// 			if (message.deletable) message.delete({ timeout: 5000 });
// 			return false;
// 		}
// 	}
// 	//are args needed & provided?
// 	if (command.needsArgs && args.length == 0) {
// 		message.reply(`you didn't provide any arguments.\nusage: \`${data.config.prefix}${command.name} ${command.usage}\``);
// 		return false;
// 	}
// 	return true;
// }
// function handleRateLimiting(r: Discord.RateLimitData){
// 	console.log("[RATE LIMITED]");
// 	console.log(r);
// }
//# sourceMappingURL=main.js.map