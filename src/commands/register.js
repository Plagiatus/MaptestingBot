"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SConfig = require("../secretconfig.json");
const Config = require("../config.json");
const main_1 = require("../main");
const request = require("request");
exports.register = {
    name: "register",
    aliases: ["reg"],
    description: "Register your username so you can join a session.",
    usage: "<Java|Bedrock> <Username>",
    needsArgs: true,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden: false,
    channel: ["bot"],
    execute: function ping(message, args) {
        if (args.length < 2) {
            message.reply(`not enough arguments. Usage: ${Config.prefix}${exports.register.name} ${exports.register.usage}`);
            return true;
        }
        let platform = args.shift().toLowerCase();
        if (platform != "java" && platform != "bedrock") {
            message.reply(`the first argument must be either "Java" or "Bedrock".`);
            return true;
        }
        let username = args.join(" ");
        username = username.trim();
        let rxCheck = username.match(new RegExp(/[a-z0-9A-Z_ ]*/g));
        if (rxCheck.length != 2) {
            message.reply(`please provide a real username.`);
            return true;
        }
        main_1.db.getUser(message.author.id, message.author.username).then(mu => {
            if (platform == "java") {
                request.get(`https://api.mojang.com/users/profiles/minecraft/${username}`, function (error, resp, body) {
                    if (!error && resp.statusCode == 200) {
                        mu.mcJavaIGN = username;
                        main_1.db.insertUser(mu);
                        message.reply(`thank you. Set your Java Username to \`${username}\``);
                        return true;
                    }
                    else {
                        message.reply(`couldn't set your Java Username to \`${username}\`. Did you misspell it?`);
                        return true;
                    }
                });
                return true;
            }
            else if (platform == "bedrock") {
                request.get(`https://xbl.io/api/v2/friends/search?gt=${username}`, function (error, resp, body) {
                    var _a;
                    try {
                        if (error)
                            throw error;
                        if (!resp)
                            throw new Error("No response");
                        if (resp.statusCode != 200)
                            throw new Error("Response status code not 200");
                        if (!((_a = JSON.parse(body)) === null || _a === void 0 ? void 0 : _a.profileUsers))
                            throw new Error("User not found");
                        mu.mcBedrockIGN = username;
                        main_1.db.insertUser(mu);
                        message.reply(`Thank you. Set your Bedrock Username to \`${username}\``);
                    }
                    catch (error) {
                        message.reply(`Couldn't set your Bedrock Username to \`${username}\`. You either misspelled it or the API denied the request, e.g. due to rate limitations. If you're sure that you spelled it correctly, please try again later.\n_If this problem persists, please contact an Admin_`);
                        console.log("[BEDROCK API] Error: ", error.message ? error.message : error);
                    }
                }).setHeader("X-Authorization", SConfig.xboxtoken);
                return true;
            }
            message.reply("How did you manage to end up with this message? Please tell an Admin about this. Error: REG1");
        });
        return true;
    }
};
