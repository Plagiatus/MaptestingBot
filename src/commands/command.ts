import { Message } from "discord.js";
import { ping } from "./ping";
import { test } from "./test";
import { help } from "./help";
import { stats } from "./stats";

type CommandHandler = (message: Message, args?: string[]) => boolean;

export class Command {
    //essentials
    name: string;
    aliases: string[];

    //infos
    description: string;
    usage: string;

    //options
    needsArgs: boolean;
    guildOnly: boolean;
    globalCooldown: number;
    individualCooldown: number;

    //the actual code to run when this command is called.
    execute: CommandHandler;
}

export let commands: Map<string, Command> = new Map(

);
commands.set(ping.name, ping);
commands.set(test.name, test);
commands.set(help.name, help);
commands.set(stats.name, stats);
// commands.set("test", Test.execute);