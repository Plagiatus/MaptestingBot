"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startsession = void 0;
const main_1 = require("../main");
exports.startsession = {
    name: "startsession",
    aliases: ["s", "start", "session", "testing", "testingsession"],
    description: "Start a testing session to playtest your map.",
    usage: "",
    needsArgs: false,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 10,
    hidden: false,
    channel: ["bot"],
    execute: function startsession(message, args) {
        //TODO: rework this so it doesn't start a session with DMs.
        main_1.sessionManager.checkWaitingSessions();
        if (main_1.sessionManager.waitingSessions.some((s) => {
            return s.hostID == message.author.id;
        })) {
            message.reply("you've already have a session pending. Please use that one.");
            return true;
        }
        if (main_1.sessionManager.runningSessions.some((s) => {
            return s.hostID == message.author.id;
        })) {
            message.reply("you already have a session running. You can only have one session running at a time.");
            return true;
        }
        for (let s of main_1.sessionManager.runningSessions) {
            if (message.member.roles.has(s.role.id)) {
                message.reply("you already are in a session. You can only be in one session at a time.");
                return false;
            }
        }
        // if(message.author.presence.status == "offline"){
        //     message.reply("you are marked as offline, that means you can't start a session. Only not-offline users can start a session.")
        //     return false;
        // }
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
        //send DM to user to start session
        message.author.send(`Session preparations started. Set up your session here: https://start.maptesting.de/setup.html?sessionid=${session.id}&timestamp=${session.setupTimestamp}\n_This link is valid for 20 minutes_.`)
            .then(() => {
            message.reply("i've sent you a DM with the link to set up your session.");
            main_1.sessionManager.waitingSessions.push(session);
            console.debug(`[STARTSESSION] preparing session #${session.id}`);
        })
            .catch(error => {
            console.log(`[STARTSESSION] Couldn't send a DM to ${message.author.tag}.\n${error}`);
            message.reply("i wasn't able to DM you the link! Do you have DMs enabled?\nTo enable DMs from this server, enable them in this servers privacy settings: https://i.imgur.com/KP0pbbS.png");
        });
        return true;
    }
};
