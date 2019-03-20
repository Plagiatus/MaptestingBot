import { Command } from "./command";
import { Message, TextChannel } from "discord.js";
import { data, db, sessionManager } from "../main";
import { Utils } from "../utils";


export let tip: Command = {
    name: "tip",
    aliases: [],
    description: "Send a player some of your hard earned experience as a special thank you.",
    usage: "<user> <amount (1-100)>",
    needsArgs: true,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 0,
    hidden: false,
    channel: ["session"],
    execute: function tip(message: Message, args: string[]): boolean {
        if (args.length < 2) {
            message.reply("not enough arguments. please provide an amount.");
            return false;
        }
        if (message.mentions.members.size != 1) {
            message.reply("you didn't provide the correct amount of users in your message. one user at a time please.");
            return false;
        }
        let amount: number = parseInt(args[1]);
        if (amount < 1 || amount > 100) {
            message.reply("the amount of XP you provided isn't in the range of [1,100].")
            return false;
        }
        
        if (message.mentions.users.first() == message.author){
            message.reply("...did you really just try to tip yourself? What did you expect would happen?")
            return false;
        }
        let sessionID: number = parseInt((<TextChannel>message.channel).parent.name.split("#")[1]);
        for (let s of sessionManager.runningSessions) {
            if (s.id == sessionID && s.hostID == message.author.id) {
                if (s.players.has(message.mentions.members.first().id)) {
                    db.getUser(message.author.id, message.author.username).then( mGive => {
                        if (mGive.experience > amount) {
                            db.getUser(message.mentions.users.first().id, message.mentions.users.first().username).then(mRecieve => {
                                let level = Utils.getLevelFromXP(mRecieve.experience);
                                mRecieve.experience += amount;
                                if (Utils.getLevelFromXP(mRecieve.experience) > level) {
                                    Utils.handleLevelup(mRecieve, message.guild);
                                } else {
                                    db.insertUser(mRecieve);
                                }
                                level = Utils.getLevelFromXP(mGive.experience);
                                mGive.experience -= amount;
                                if (Utils.getLevelFromXP(mGive.experience) < level) {
                                    Utils.setLevelRole(message.guild.members.get(message.author.id), Utils.getLevelFromXP(mGive.experience));
                                }
                                db.insertUser(mGive);
                                message.reply(`you tipped ${amount} experience to ${message.mentions.members.first()}.`);
                            });
                        } else {
                            message.reply(`you don't have ${amount} experience to give away. You currently have ${mGive.experience}.`);
                            return false;
                        }
                    });
                } else {
                    message.reply("the player you're trying to tip isn't in a session with you.");
                    return false;
                }
                
                return true;
            } else {
                message.reply("you're not the host of this session, you can't tip anyone.");
                return false;
            }
        }
        return false;
    }
}