import { Command } from "./command";
import { Message, TextChannel } from "discord.js";
import { TestingSession } from "../utils";
import { data, sessionManager } from "../main";

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
                message.reply("you already have a session running. You can only have one session running at a time.");
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
        message.reply(`Session started. set it up here: https://maptestingbot.herokuapp.com/?sessionid=${session.id}&timestamp=${session.setupTimestamp}`);
        data.waitingSessions.push(session);
        console.debug(`preparing session #${session.id}`);

        return true;
    }
}

function setupSession(session: TestingSession) {
    let tc: TextChannel = <TextChannel>session.guild.channels.get("listing");
    tc.send("Test");
}