"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ping_1 = require("./ping");
const test_1 = require("./test");
const help_1 = require("./help");
const stats_1 = require("./stats");
// import { promote } from "./promote";
// import { demote } from "./demote";
const bobdosomething_1 = require("./bobdosomething");
const startsession_1 = require("./startsession");
const tip_1 = require("./tip");
const stopsession_1 = require("./stopsession");
const leave_1 = require("./leave");
const addxp_1 = require("./addxp");
const register_1 = require("./register");
const mute_1 = require("./mute");
const caniping_1 = require("./caniping");
const report_1 = require("./report");
const kick_1 = require("./kick");
class Command {
}
exports.Command = Command;
exports.commands = new Map();
//TODO: add all the commands
//general
exports.commands.set(help_1.help.name, help_1.help);
exports.commands.set(ping_1.ping.name, ping_1.ping);
exports.commands.set(test_1.test.name, test_1.test);
// commands.set(demote.name, demote);
// commands.set(promote.name, promote);
exports.commands.set(stats_1.stats.name, stats_1.stats);
exports.commands.set(addxp_1.addxp.name, addxp_1.addxp);
exports.commands.set(report_1.report.name, report_1.report);
//session
exports.commands.set(startsession_1.startsession.name, startsession_1.startsession);
exports.commands.set(stopsession_1.stopsession.name, stopsession_1.stopsession);
exports.commands.set(tip_1.tip.name, tip_1.tip);
exports.commands.set(leave_1.leave.name, leave_1.leave);
exports.commands.set(register_1.register.name, register_1.register);
exports.commands.set(mute_1.mute.name, mute_1.mute);
exports.commands.set(kick_1.kick.name, kick_1.kick);
exports.commands.set(caniping_1.caniping.name, caniping_1.caniping);
//jokes
exports.commands.set(bobdosomething_1.bobdosomething.name, bobdosomething_1.bobdosomething);
