"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
const main_1 = require("../main");
exports.startsession = {
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
    execute: function ping(message, args) {
        main_1.data.checkWaitingSeasons();
        if (main_1.data.waitingSessions.some((s) => {
            return s.hostID == message.author.id;
        })) {
            message.reply("you've already created a session in the last 10 minutes. Please don't spam.");
            return true;
        }
        if (main_1.data.runningSessions.some((s) => {
            return s.hostID == message.author.id;
        })) {
            message.reply("you already have a session running. You can only have one session running at a time.");
            return true;
        }
        for (let role of main_1.sessionManager.sessionRoles.values()) {
            if (message.member.roles.has(role.id)) {
                message.reply("you already have a session running. You can only have one session running at a time.");
                return true;
            }
        }
        let session = {
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
        };
        //TODO: change this to a DM
        message.reply(`Session started. set it up here: https://maptestingbot.herokuapp.com/?sessionid=${session.id}&timestamp=${session.setupTimestamp}`);
        main_1.data.waitingSessions.push(session);
        console.debug(`[STARTSESSION] preparing session #${session.id}`);
        return true;
    }
};
function setupSession(session) {
    let tc = session.guild.channels.get("listing");
    tc.send("Test");
}
command_1.commands.set(exports.startsession.name, exports.startsession);
