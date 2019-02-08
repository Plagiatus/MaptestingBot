"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ping_1 = require("./ping");
const test_1 = require("./test");
const help_1 = require("./help");
const stats_1 = require("./stats");
const promote_1 = require("./promote");
const demote_1 = require("./demote");
const bobdosomething_1 = require("./bobdosomething");
class Command {
}
exports.Command = Command;
exports.commands = new Map();
exports.commands.set(ping_1.ping.name, ping_1.ping);
exports.commands.set(test_1.test.name, test_1.test);
exports.commands.set(help_1.help.name, help_1.help);
exports.commands.set(stats_1.stats.name, stats_1.stats);
exports.commands.set(promote_1.promote.name, promote_1.promote);
exports.commands.set(demote_1.demote.name, demote_1.demote);
exports.commands.set(bobdosomething_1.bobdosomething.name, bobdosomething_1.bobdosomething);
