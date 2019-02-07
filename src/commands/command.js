"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ping_1 = require("./ping");
const test_1 = require("./test");
const help_1 = require("./help");
const stats_1 = require("./stats");
class Command {
}
exports.Command = Command;
exports.commands = new Map();
exports.commands.set(ping_1.ping.name, ping_1.ping);
exports.commands.set(test_1.test.name, test_1.test);
exports.commands.set(help_1.help.name, help_1.help);
exports.commands.set(stats_1.stats.name, stats_1.stats);
// commands.set("test", Test.execute);
