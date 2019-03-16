import { Command } from "./command";
import { Message, TextChannel } from "discord.js";
import { sessionManager } from "../main";

export let stopsession: Command = {
    name : "stopsession",
    aliases: ["stop","st","end","endsession"],
    description: "End the session.",
    usage: "",
    needsArgs: false,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden: false,
    channel: ["session"],
    execute: function end(message: Message, args: string[]): boolean{
        if(!(<TextChannel>message.channel).parent.name.includes("session")){
            message.reply(`How did you manage to run this command? Please tell an Admin about this!`);
            return true;
        }
        let sessionID: number = parseInt((<TextChannel>message.channel).parent.name.split("#")[1]);
        for(let s of sessionManager.runningSessions){
            if(s.id == sessionID && s.hostID == message.author.id){
                sessionManager.endSession(s.id);
                return true;
            }
        }
        message.reply(`you're not the host of this session, you cannot end it.`).then(
            m => {
                (<Message>m).delete(5000);
            }
        );
        message.delete();
        return true;
    }
}
