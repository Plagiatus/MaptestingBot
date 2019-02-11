"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
const Config = require("./config.json");
const SConfig = require("./secretconfig.json");
const utils_js_1 = require("./utils.js");
const database_js_1 = require("./database.js");
const data_js_1 = require("./data.js");
const httpserver_1 = require("./httpserver");
const sessionmanager_js_1 = require("./sessionmanager.js");
exports.client = new Discord.Client();
exports.db = new database_js_1.Database(dbready);
let globalCooldowns = new Discord.Collection();
let individualCooldowns = new Discord.Collection();
let sessionStarter = new httpserver_1.SessionStarter();
function dbready() {
    console.debug("[MAIN] Database connected.");
    exports.client.login(SConfig.token);
}
exports.client.once('ready', () => {
    console.debug('[MAIN] Client connected. Ready to Go!');
    exports.data = new data_js_1.Data();
    exports.sessionManager = new sessionmanager_js_1.SessionManager();
});
exports.client.on("message", messageHandler);
function messageHandler(message) {
    if (!message.content.startsWith(Config.prefix) || message.author.bot)
        return;
    let args = message.content.slice(Config.prefix.length).split(/ +/);
    let commandName = args.shift().toLowerCase();
    let command = utils_js_1.Utils.findCommandWithAlias(commandName);
    //does command exist?
    if (!command) {
        message.delete(5000);
        return message.reply(`the command you're trying to execute doesn't exist.`).then(m => {
            m.delete(5000);
        });
    }
    ;
    //is this able to be executed inside a direct message?
    if (command.guildOnly && message.channel.type != "text") {
        return message.reply("this command can't be run inside DMs.");
    }
    //are you in the correct channel?
    if (message.channel.type == "text") {
        if (message.channel.parent) {
            if (!(message.channel.name.startsWith("bot") && command.channel.some(v => { return v == "bot" || v == "all"; })) &&
                !(message.channel.parent.name.startsWith("session") && command.channel.some(v => { return v == "session" || v == "all"; }))) {
                message.delete();
                if (command.channel.some(v => { return v == "bot"; })) {
                    return message.channel.send("This command can only be executed in the bot-commands channel.").then(m => {
                        m.delete(5000);
                    });
                }
                if (command.channel.some(v => { return v == "session"; })) {
                    return message.channel.send("This command can only be executed in a session channel.").then(m => {
                        m.delete(5000);
                    });
                }
                return message.channel.send("This command cannot be executed in this channel.").then(m => {
                    m.delete(5000);
                });
            }
        }
        else {
            if (!(message.channel.name.startsWith("bot") && command.channel.some(v => { return v == "bot" || v == "all"; }))) {
                message.delete();
                if (command.channel.some(v => { return v == "bot"; })) {
                    return message.channel.send("This command can only be executed in the bot-commands channel.").then(m => {
                        m.delete(5000);
                    });
                }
                return message.channel.send("This command can only be executed in a session channel.").then(m => {
                    m.delete(5000);
                });
            }
        }
        //does the executor have the permissions to do that?
        if (command.grantedOnly && !exports.data.isUserPermitted(message.guild.id, message.author.id)) {
            return message.reply(`you don't have permission to run this command.`);
        }
    }
    //are args needed & provided?
    if (command.needsArgs && args.length == 0) {
        return message.reply(`you didn't provide any arguments.\nusage: !${command.name} ${command.usage}`);
    }
    //is the command on global cooldown?
    if (globalCooldowns.has(command.name)) {
        if (globalCooldowns.get(command.name) < Date.now()) {
            globalCooldowns.delete(command.name);
        }
        else {
            return message.reply(`this command is on global cooldown. Please wait ${((globalCooldowns.get(command.name) - Date.now()) / 1000).toFixed(1)} seconds.`).then((messageSent) => {
                if (messageSent instanceof Discord.Message) {
                    messageSent.delete(5000);
                }
            });
        }
    }
    else if (command.globalCooldown > 0) {
        globalCooldowns.set(command.name, Date.now() + command.globalCooldown * 1000);
    }
    //is the command on individual cooldown?
    if (!individualCooldowns.has(command.name)) {
        individualCooldowns.set(command.name, new Discord.Collection());
    }
    let timestamps = individualCooldowns.get(command.name);
    if (timestamps.has(message.author.id)) {
        if (timestamps.get(message.author.id) < Date.now()) {
            timestamps.delete(message.author.id);
        }
        else {
            return message.reply(`this command is on cooldown for you. Please wait ${((timestamps.get(message.author.id) - Date.now()) / 1000).toFixed(1)} seconds.`).then((messageSent) => {
                if (messageSent instanceof Discord.Message) {
                    messageSent.delete(5000);
                }
            });
        }
    }
    try {
        let commandShouldGoOnCooldown = command.execute(message, args);
        if (command.individualCooldown > 0) {
            if (commandShouldGoOnCooldown)
                timestamps.set(message.author.id, Date.now() + command.individualCooldown * 1000);
        }
    }
    catch (error) {
        console.error(error);
    }
}
// handle 'error' events properly
exports.client.on('error', console.error);
