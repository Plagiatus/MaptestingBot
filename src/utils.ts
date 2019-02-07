import { Message } from "discord.js";
import { Command, commands } from "./commands/command";

export class Utils {
    public static removeMessage(message: Message, delay: number = 0){
        setTimeout(message.delete,delay);
    }

    public static findCommandWithAlias(alias: string): Command {
    if (commands.has(alias)) return commands.get(alias);
    for(let c of commands){
        if(c[1].aliases.indexOf(alias) > -1) return c[1];
    }
    return null;
}

}