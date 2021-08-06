"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
const data_1 = require("./data");
const util_1 = require("./util");
const data = new data_1.Data();
const client = new Discord.Client();
client.once("ready", () => {
    console.log("[Discord] Ready.");
});
client.on("message", handleMessage);
client.on("rateLimit", handleRateLimiting);
client.login(data.secretConfig.token);
function handleMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!message.content.startsWith(data.config.prefix) || message.author.bot)
            return;
        // console.log(message);
        let args = message.content.slice(data.config.prefix.length).split(/ +/);
        let commandName = args.shift().toLowerCase();
        let command = util_1.findCommandWithAlias(commandName);
        if (yield canCommandBeRun(command, args, message)) {
            try {
                command.execute(message, args);
            }
            catch (error) {
                message.reply("Something went wrong while executing that command: " + error);
                message.channel.send("If this problem persists, ping @Plagiatus.");
            }
        }
    });
}
// test();
// async function test(){
// 	console.log("1");
// 	await timeoutToPromise(1000, ()=>{});
// 	console.log("2");
// }
// console.log(data.config);
function canCommandBeRun(command, args, message) {
    return __awaiter(this, void 0, void 0, function* () {
        //does it exist?
        if (!command) {
            let newMessage = yield message.reply("The command you're trying to execute doesn't exist.");
            if (newMessage.deletable)
                newMessage.delete({ timeout: 5000 });
            if (message.deletable)
                message.delete();
            return false;
        }
        //dm?
        if (message.channel.type != "text" && command.guildOnly) {
            message.reply("This command can only be executed in the respective server channel.");
            return false;
        }
        //channel type
        if (message.channel.type == "text" && !command.channel.includes("all")) {
            let channeltype = "nonsession";
            let channel = message.channel;
            if (channel.name.startsWith("bot")) {
                channeltype = "bot";
            }
            else if (channel.parent && channel.parent.name.startsWith("session")) {
                channeltype = "session";
            }
            if (!command.channel.includes(channeltype)) {
                let newMessage = yield message.reply("This command can only be executed in the following channeltypes: " + command.channel);
                if (newMessage.deletable)
                    newMessage.delete({ timeout: 5000 });
                if (message.deletable)
                    message.delete({ timeout: 5000 });
                return false;
            }
        }
        //are args needed & provided?
        if (command.needsArgs && args.length == 0) {
            message.reply(`you didn't provide any arguments.\nusage: \`${data.config.prefix}${command.name} ${command.usage}\``);
            return false;
        }
        return true;
    });
}
function handleRateLimiting(r) {
    console.log("[RATE LIMITED]");
    console.log(r);
}
//# sourceMappingURL=main.js.map