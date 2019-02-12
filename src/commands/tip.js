"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const utils_1 = require("../utils");
exports.tip = {
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
    execute: function tip(message, args) {
        if (args.length < 2) {
            message.reply("not enough arguments. please provide an amount.");
            return false;
        }
        if (message.mentions.members.size != 1) {
            message.reply("you didn't provide the correct amount of users in your message. one user at a time please.");
            return false;
        }
        let amount = parseInt(args[1]);
        if (amount < 1 || amount > 100) {
            message.reply("the amount of XP you provided isn't in the range of [1,100].");
            return false;
        }
        if (message.mentions.users.first() == message.author) {
            message.reply("...did you really just try to tip yourself? What did you expect would happen?");
            return false;
        }
        let sessionID = parseInt(message.channel.parent.name.split("#")[1]);
        for (let s of main_1.sessionManager.runningSessions) {
            if (s.id == sessionID && s.hostID == message.author.id) {
                if (main_1.sessionManager.sessionPlayers.get(sessionID).has(message.mentions.members.first().id)) {
                    main_1.db.getUser(message.author.id, mGive => {
                        if (mGive.experience > amount) {
                            main_1.db.getUser(message.mentions.users.first().id, mRecieve => {
                                let level = utils_1.Utils.getLevelFromXP(mRecieve.experience);
                                mRecieve.experience += amount;
                                if (utils_1.Utils.getLevelFromXP(mRecieve.experience) > level) {
                                    utils_1.Utils.handleLevelup(mRecieve, message.guild);
                                }
                                else {
                                    main_1.db.insertUser(mRecieve);
                                }
                                level = utils_1.Utils.getLevelFromXP(mGive.experience);
                                mGive.experience -= amount;
                                if (utils_1.Utils.getLevelFromXP(mGive.experience) < level) {
                                    utils_1.Utils.setLevelRole(message.guild.members.get(message.author.id), utils_1.Utils.getLevelFromXP(mGive.experience));
                                }
                                main_1.db.insertUser(mGive);
                                message.reply(`you tipped ${amount} experience to ${message.mentions.members.first()}.`);
                            });
                        }
                        else {
                            message.reply(`you don't have ${amount} experience to give away. You currently have ${mGive.experience}.`);
                            return false;
                        }
                    });
                }
                else {
                    message.reply("the player you're trying to tip isn't in a session with you.");
                    return false;
                }
                return true;
            }
            else {
                message.reply("you're not the host of this session, you can't tip anyone.");
                return false;
            }
        }
        return false;
    }
};
