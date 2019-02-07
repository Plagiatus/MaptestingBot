"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database = require("../Database");
exports.stats = {
    name: "stats",
    aliases: ["me", "lvl", "level"],
    description: "Check out your own stats as they are saved on the server.",
    usage: "",
    globalCooldown: 0,
    individualCooldown: 30,
    guildOnly: false,
    needsArgs: false,
    execute: function test(message, args) {
        Database.insert({ test: "test" });
        return true;
    }
};
