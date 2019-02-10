import { Command } from "./command";
import { Message } from "discord.js";
import { TestingSession } from "../utils";
import { data, sessionManager, db } from "../main";

export let startsession: Command = {
    name: "startsession",
    aliases: ["s", "start", "session", "testing", "testingsession"],
    description: "Start a testing session to playtest your map.",
    usage: "",
    needsArgs: false,
    guildOnly: false,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 10,
    hidden: false,
    channel: ["bot"],
    execute: function ping(message: Message, args: string[]): boolean {
        data.checkWaitingSeasons();
        if (data.waitingSessions.some((s) => {
            return s.hostID == message.author.id
        })) {
            message.reply("you've already created a session in the last 10 minutes. Please don't spam.");
            return true;
        }
        if (data.runningSessions.some((s) => {
            return s.hostID == message.author.id
        })) {
            message.reply("you already have a session running. You can only have one session running at a time.");
            return true;
        }
        for (let role of sessionManager.sessionRoles.values()) {
            if (message.member.roles.has(role.id)) {
                message.reply("you already are in a session. You can only be in one session at a time.");
                return true;
            }
        }

        let session: TestingSession = {
            endTimestamp: Infinity,
            hostID: message.author.id,
            id: Math.floor(Math.random() * 10000),
            additionalInfo: "",
            ip: "",
            mapDescription: "",
            mapTitle: "",
            maxParticipants: Infinity,
            platform: null,
            resourcepack: "",
            startTimestamp: Infinity,
            setupTimestamp: Date.now(),
            state: "preparing",
            category: null,
            version: null,
            guild: message.guild,
            ping: false
        }
        //send DM to user to start session
        message.author.send(`Session preparations started. Set up your session here: https://maptestingbot.herokuapp.com/?sessionid=${session.id}&timestamp=${session.setupTimestamp}\n_This link is valid for 10 minutes_.`)
            .then(() => {
                message.reply("i've sent you a DM with the link to set up your session.");
                data.waitingSessions.push(session);
                console.debug(`[STARTSESSION] preparing session #${session.id}`);
            })
            .catch(error => {
                console.log(`[STARTSESSION] Couldn't send a DM to ${message.author.tag}.\n${error}`);
                message.reply("i wasn't able to DM you the link! Do you have DMs enabled?\nTo enable DMs from this server, enable them in this servers privacy settings: https://i.imgur.com/KP0pbbS.png");
            })
        return true;
    }
}

