import { Command } from "./command";
import { Message, RichEmbed } from "discord.js";
import { MongoUser, Utils } from "../utils";
import { db } from "../main";
import * as Config from "../config.json";

export let rankings: Command = {
	name: "ranking",
	aliases: ["lvls", "levels", "rankings", "list"],
	description: "Check out everyones stats.",
	usage: "",
	globalCooldown: 0,
	individualCooldown: 3,
	guildOnly: false,
	grantedOnly: false,
	needsArgs: false,
	hidden: false,
	channel: ["bot"],
	execute: function rankings(message: Message, args: string[]): boolean {
		let embed: RichEmbed = new RichEmbed()
			.addField("Listing of all players", `[Click here](https://start.maptesting.de/list.html)`);
		message.channel.send(embed);
		return true;

	}
}
