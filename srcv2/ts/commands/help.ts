import { Message, TextChannel, MessageEmbed } from "discord.js";
import { Data } from "../data";
import { findCommandWithAlias } from "../util";

export = {
	name: "help",
	aliases: ["h", "info"],
	description: "Displays information about the available commands.",
	usage: "[command]",
	example: "startsession",
	globalCooldown: 0,
	individualCooldown: 0,
	guildOnly: false,
	grantedOnly: false,
	hidden: false,
	needsArgs: false,
	channel: ["bot", "session"],
	execute: function test(message: Message, args: string[]): boolean {
		let d: Data = new Data();
		let embed: MessageEmbed = new MessageEmbed();

		// generic help command
		if (!args.length) {
			let useableCommands: Command[] = [];
			let searchCriteria: any = { channel: [] };

			if (message.channel.type == "dm") {
				searchCriteria.guildOnly = false;
			} else {
				let channel: TextChannel = message.channel as TextChannel;
				if (channel.name.startsWith("bot")) {
					searchCriteria.channel.push("bot");
				} else if (channel.parent && channel.parent.name.startsWith("session")) {
					searchCriteria.channel.push("session");
				} else {
					searchCriteria.channel.push("all");
				}
			}
			for (let c of d.commands.values()) {
				if (fitsCriteria(c, searchCriteria)) useableCommands.push(c);
			}

			embed.setTitle("Available commands in this channel");
			useableCommands.sort((a, b) => {
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			})
			for (let c of useableCommands) {
				embed.addField(c.name, c.description, true);
			}

			embed.addField("Furter Information", `For detailed information, use ${d.config.prefix}${this.name} [command]`);

		}

		// command specific help command
		else {

			let command: Command = findCommandWithAlias(args[0].toLowerCase());
			if (!command) {
				message.reply(args[0] + " is not a valid command.");
				return true;
			} else {
				embed.setTitle(command.name)
				.addField("Description", command.description)
				.addField("Syntax", d.config.prefix + command.name + " " + command.usage)
				.addField("Aliases", command.aliases);
				if(command.example) {
					embed.addField("Example", d.config.prefix + command.name + " " + command.example)
				}
			}
		}
		message.channel.send(embed);
		return true;
	}
}

function fitsCriteria(com: Command, criteria: any): boolean {
	for (let key in criteria) {
		if (com[key] === undefined) return false;
		if (criteria[key].constructor === Array && com[key].constructor === Array) {
			for (let obj of criteria[key]) {
				if (!com[key].includes(obj)) return false;
			}
		} else if (criteria[key].constructor === Array || com[key].constructor === Array) {
			return false;
		} else if (criteria[key] !== com[key]) {
			return false;
		}
	}
	return true;
}