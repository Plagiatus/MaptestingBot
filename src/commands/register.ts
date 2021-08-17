import { Command } from "./command";
import { Message } from "discord.js";
import * as SConfig from "../secretconfig.json";
import * as Config from "../config.json";
import { db } from "../main";
import { MongoUser } from "../utils";
import request = require("request");

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
		if (args.length < 2) {
			message.reply(`not enough arguments. Usage: ${Config.prefix}${register.name} ${register.usage}`);
			return true;
		}
		let platform: string = args.shift().toLowerCase();
		if (platform != "java" && platform != "bedrock") {
			message.reply(`the first argument must be either "Java" or "Bedrock".`);
			return true;
		}
		let username: string = args.join(" ");
		username = username.trim();

		let rxCheck = username.match(new RegExp(/[a-z0-9A-Z_ ]*/g));
		if (rxCheck.length != 2) {
			message.reply(`please provide a real username.`)
			return true;
		}

		db.getUser(message.author.id, message.author.username).then(mu => {
			if (platform == "java") {
				request.get(`https://api.mojang.com/users/profiles/minecraft/${username}`, function (error, resp, body) {
					if (!error && resp.statusCode == 200) {
						mu.mcJavaIGN = username;
						db.insertUser(mu);
						message.reply(`thank you. Set your Java Username to \`${username}\``);
						return true;
					} else {
						message.reply(`couldn't set your Java Username to \`${username}\`. Did you misspell it?`);
						return true;
					}
				});
				return true;
			}
			else if (platform == "bedrock") {
				request.get(`https://xboxapi.com/v2/xuid/${username}`, function (error, resp, body) {
					let noProblem: boolean = false;
					if (noProblem) noProblem = !error;
					if (noProblem) noProblem = !!resp;
					if (!error && resp && resp.statusCode == 200) {
						mu.mcBedrockIGN = username;
						db.insertUser(mu);
						message.reply(`Thank you. Set your Bedrock Username to \`${username}\``);
					}
					if (error || !resp) {
						message.reply(`Couldn't set your Bedrock Username to \`${username}\`. You either misspelled it or the API denied the request due to rate limitations. If you're sure that you spelled it correctly, please try again in an hour.\n_If this problem persists, please contact an Admin_`);
						console.log("[BEDROCK API] Error: ", error, resp?.statusCode, resp?.statusMessage);
					}
				}).setHeader("X-AUTH", SConfig.xboxtoken);
				return true;
			}
			message.reply("How did you manage to end up with this message? Please tell an Admin about this. Error: REG1");
		});

		return true;
	}
}
