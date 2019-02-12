import * as Discord from "discord.js";
import * as Config from "./config.json";
import * as SConfig from "./secretconfig.json";
import { Command } from "./commands/command";
import { Utils } from "./utils.js";
import { Database } from "./database.js";
import { Data } from "./data.js";
import { SessionStarter } from "./httpserver";
import { SessionManager } from "./sessionmanager.js";


export const client = new Discord.Client();
export let data: Data;
export const db: Database = new Database(dbready);
export let sessionManager: SessionManager;

let globalCooldowns: Discord.Collection<string, number> = new Discord.Collection();
let individualCooldowns: Discord.Collection<string, Discord.Collection<string, number>> = new Discord.Collection();

let sessionStarter: SessionStarter = new SessionStarter();

function dbready() {
    console.debug("[MAIN] Database connected.");
    client.login(SConfig.token);
}

client.once('ready', () => {
    console.debug('[MAIN] Client connected. Ready to Go!');
    data = new Data();
    sessionManager = new SessionManager();
});

// handle 'error' events properly
client.on('error', console.error);

client.on("message", messageHandler);

client.on("presenceUpdate", handlePresenceUpdate);

function messageHandler(message: Discord.Message) {
    if (!message.content.startsWith(Config.prefix) || message.author.bot) return;
    let args: string[] = message.content.slice(Config.prefix.length).split(/ +/);
    let commandName: string = args.shift().toLowerCase();


    let command: Command = Utils.findCommandWithAlias(commandName);

    //does command exist?
    if (!command) {
        message.delete(5000);
        return message.reply(`the command you're trying to execute doesn't exist.`).then(m => {
            (<Discord.Message>m).delete(5000);
        });
    };


    //is this able to be executed inside a direct message?
    if (command.guildOnly && message.channel.type != "text") {
        return message.reply("this command can't be run inside DMs.");
    }

    //are you in the correct channel?
    if (message.channel.type == "text") {

        if ((<Discord.TextChannel>message.channel).parent) {
            if (!((<Discord.TextChannel>message.channel).name.startsWith("bot") && command.channel.some(v => { return v == "bot" || v == "all" })) &&
                !((<Discord.TextChannel>message.channel).parent.name.startsWith("session") && command.channel.some(v => { return v == "session" || v == "all" }))
            ) {
                message.delete();
                if (command.channel.some(v => { return v == "bot" })) {
                    return message.channel.send("This command can only be executed in the bot-commands channel.").then(m => {
                        (<Discord.Message>m).delete(5000);
                    });
                }
                if (command.channel.some(v => { return v == "session" })) {
                    return message.channel.send("This command can only be executed in a session channel.").then(m => {
                        (<Discord.Message>m).delete(5000);
                    });
                }
                return message.channel.send("This command cannot be executed in this channel.").then(m => {
                    (<Discord.Message>m).delete(5000);
                });
            }
        } else {
            if (!((<Discord.TextChannel>message.channel).name.startsWith("bot") && command.channel.some(v => { return v == "bot" || v == "all" }))) {
                message.delete();
                if (command.channel.some(v => { return v == "bot" })) {
                    return message.channel.send("This command can only be executed in the bot-commands channel.").then(m => {
                        (<Discord.Message>m).delete(5000);
                    });
                }
                return message.channel.send("This command can only be executed in a session channel.").then(m => {
                    (<Discord.Message>m).delete(5000);
                });
            }
        }
        //does the executor have the permissions to do that?
        if (command.grantedOnly && !data.isUserPermitted(message.guild.id, message.author.id)) {
            return message.reply(`you don't have permission to run this command.`)
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
        } else {
            return message.reply(`this command is on global cooldown. Please wait ${((globalCooldowns.get(command.name) - Date.now()) / 1000).toFixed(1)} seconds.`).then(
                (messageSent) => {
                    if (messageSent instanceof Discord.Message) {
                        messageSent.delete(5000);
                    }
                }
            );
        }
    } else if (command.globalCooldown > 0) {
        globalCooldowns.set(command.name, Date.now() + command.globalCooldown * 1000);
    }

    //is the command on individual cooldown?
    if (!individualCooldowns.has(command.name)) {
        individualCooldowns.set(command.name, new Discord.Collection<string, number>());
    }

    let timestamps: Discord.Collection<string, number> = individualCooldowns.get(command.name);
    if (timestamps.has(message.author.id)) {

        if (timestamps.get(message.author.id) < Date.now()) {
            timestamps.delete(message.author.id);
        }
        else {
            return message.reply(`this command is on cooldown for you. Please wait ${((timestamps.get(message.author.id) - Date.now()) / 1000).toFixed(1)} seconds.`).then(
                (messageSent) => {
                    if (messageSent instanceof Discord.Message) {
                        messageSent.delete(5000);
                    }
                }
            );
        }
    }
    try {
        let commandShouldGoOnCooldown: boolean = command.execute(message, args);
        if (command.individualCooldown > 0) {
            if (commandShouldGoOnCooldown)
                timestamps.set(message.author.id, Date.now() + command.individualCooldown * 1000);
        }
    } catch (error) {
        console.error(error);
    }



}


function handlePresenceUpdate(oldMember:Discord.GuildMember, newMember:Discord.GuildMember) {
    if (oldMember.presence.status == newMember.presence.status) return;

    if (newMember.presence.status == "offline") {
        for (let s of sessionManager.sessionPlayers.keys()) {
            if (sessionManager.sessionPlayers.get(s).has(newMember.id)) {
                newMember.send("You've gone offline while in a session. You will be removed from the session in 2 minutes if you don't come back online.\nIf you are the host, the session will be ended in 2 minutes.");
                sessionManager.playersOffline.set(newMember.id,{timestamp: Date.now(), user: newMember});
            }
        }
    } else {
        for(let s of sessionManager.playersOffline.keys()){
            if(s == newMember.id){
                sessionManager.playersOffline.delete(s);
            }
        }
    }

}