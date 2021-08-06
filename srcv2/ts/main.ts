import * as Discord from "discord.js";
import { Data } from "./data";
import { findCommandWithAlias, timeoutToPromise } from "./util";

const data = new Data();
const client: Discord.Client = new Discord.Client();

client.once("ready", () => {
	console.log("[Discord] Ready.");
})

client.on("message", handleMessage);
client.on("rateLimit", handleRateLimiting);

client.login(data.secretConfig.token);

async function handleMessage(message: Discord.Message) {
	if (!message.content.startsWith(data.config.prefix) || message.author.bot) return;
	// console.log(message);
	let args: string[] = message.content.slice(data.config.prefix.length).split(/ +/);
	let commandName: string = args.shift().toLowerCase();
	let command: Command = findCommandWithAlias(commandName);
	if (await canCommandBeRun(command, args, message)) {
		try {
			command.execute(message, args);
		} catch (error) {
			message.reply("Something went wrong while executing that command: " + error);
			message.channel.send("If this problem persists, ping @Plagiatus.");
		}
	}
}


// test();
// async function test(){
// 	console.log("1");
// 	await timeoutToPromise(1000, ()=>{});
// 	console.log("2");
// }

// console.log(data.config);

async function canCommandBeRun(command: Command, args: string[], message: Discord.Message): Promise<boolean> {
	//does it exist?
	if (!command) {
		let newMessage: Discord.Message = await message.reply("The command you're trying to execute doesn't exist.");
		if (newMessage.deletable) newMessage.delete({ timeout: 5000 });
		if (message.deletable) message.delete();
		return false;
	}

	//dm?
	if (message.channel.type != "text" && command.guildOnly) {
		message.reply("This command can only be executed in the respective server channel.")
		return false;
	}

	//channel type
	if (message.channel.type == "text" && !command.channel.includes("all")) {
		let channeltype: ("nonsession" | "session" | "bot") = "nonsession";
		let channel = message.channel as Discord.TextChannel;
		if (channel.name.startsWith("bot")) {
			channeltype = "bot";
		} else if (channel.parent && channel.parent.name.startsWith("session")) {
			channeltype = "session";
		}

		if (!command.channel.includes(channeltype)) {
			let newMessage: Discord.Message = await message.reply("This command can only be executed in the following channeltypes: " + command.channel);
			if (newMessage.deletable) newMessage.delete({ timeout: 5000 });
			if (message.deletable) message.delete({ timeout: 5000 });

			return false;
		}
	}

	//are args needed & provided?
	if (command.needsArgs && args.length == 0) {
		message.reply(`you didn't provide any arguments.\nusage: \`${data.config.prefix}${command.name} ${command.usage}\``);
		return false;
	}

	return true;
}

function handleRateLimiting(r: Discord.RateLimitData){
	console.log("[RATE LIMITED]");
	console.log(r);
}