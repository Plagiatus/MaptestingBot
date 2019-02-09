"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
exports.startsession = {
    name: "startsession",
    aliases: ["s", "startsession", "session", "testing", "testingsession"],
    description: "Start a testing session to playtest your map.",
    usage: "",
    needsArgs: false,
    guildOnly: false,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 10,
    hidden: false,
    execute: function ping(message, args) {
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
            ressourcepack: "",
            startTimestamp: Infinity,
            setupTimestamp: Date.now(),
            state: "preparing",
            category: null,
            version: null,
            guild: message.guild
        };
        message.reply(`Session started. set it up here: https://maptestingbot.herokuapp.com/?sessionid=${session.id}`);
        main_1.data.waitingSessions.push(session);
        return true;
    }
};
