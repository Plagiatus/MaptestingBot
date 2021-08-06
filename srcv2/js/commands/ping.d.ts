import { Message } from "discord.js";
declare const _default: {
    name: string;
    aliases: string[];
    description: string;
    usage: string;
    needsArgs: boolean;
    guildOnly: boolean;
    grantedOnly: boolean;
    globalCooldown: number;
    individualCooldown: number;
    hidden: boolean;
    channel: any[];
    execute: (message: Message, args: string[]) => boolean;
};
export = _default;
