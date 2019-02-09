import { Message, Guild, RichEmbed } from "discord.js";
import { Command, commands } from "./commands/command";
import { xpSettings } from "./config.json";

export class Utils {
    public static removeMessage(message: Message, delay: number = 0) {
        setTimeout(message.delete, delay);
    }

    public static findCommandWithAlias(alias: string): Command {
        if (commands.has(alias)) return commands.get(alias);
        for (let c of commands) {
            if (c[1].aliases.indexOf(alias) > -1) return c[1];
        }
        return null;
    }

    public static getLevelFromXP(xp: number): number{
        let level: number = 0;
        for(let i:number = 0; i < xpSettings.levels.length; i++){
            if(xp >= xpSettings.levels[i].minXP){
                level = i;
            }
        }

        return level;
    }

    public static getLevelColor(level: number): string{
        return xpSettings.levels[level].color;
    }

    public static getLevelImage(level: number): string{
        return xpSettings.levels[level].img;
    }

    public static SessionToEmbed(session: TestingSession): RichEmbed{
        let emb: RichEmbed = new RichEmbed()
        .setTitle(session.mapTitle)
        .addField("Description",session.mapDescription);
        return emb;
    }
}

export interface MongoUser{
    discordID: string;
    experience: number;
    sessionsHosted: number;
    hostedSessionsDuration: number;
    sessionsJoined: number;
    joinedSessionsDuration: number;
    lastPing: number;
    muted: boolean;
    mcJavaIGN: string;
    mcBedrockIGN: string
}

export interface TestingSession{
    id: number;
    hostID: string;
    setupTimestamp: number;
    startTimestamp: number;
    endTimestamp: number;
    platform: "java"|"bedrock";
    version: string;
    maxParticipants: number;
    mapTitle: string;
    mapDescription: string;
    additionalInfo: string;
    ressourcepack: string;
    ip: string;
    category: "stream"|"minigame"|"adventure"|"datapack"|"misc";
    state: "preparing"|"running"|"ending";
    guild: Guild;
}

