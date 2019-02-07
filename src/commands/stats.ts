import * as Database from "../Database";
import { Command } from "./command";
import { Message } from "discord.js";

export let stats: Command = {
    name: "stats",
    aliases: ["me","lvl","level"],
    description: "Check out your own stats as they are saved on the server.",
    usage: "",
    globalCooldown: 0,
    individualCooldown: 30,
    guildOnly: false,
    needsArgs: false,
    execute: function test(message: Message, args: string[]): boolean {
        Database.insert({test:"test"});
        return true;
    }
}