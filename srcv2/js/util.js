"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
function timeoutToPromise(time, f, ...args) {
    return new Promise((res) => {
        setTimeout(() => {
            f();
            res();
        }, time, ...args);
    });
}
exports.timeoutToPromise = timeoutToPromise;
function findCommandWithAlias(name) {
    let commands = new data_1.Data().commands;
    if (commands.has(name))
        return commands.get(name);
    for (let c of commands) {
        if (c[1].aliases.indexOf(name) > -1)
            return c[1];
    }
    return null;
}
exports.findCommandWithAlias = findCommandWithAlias;
function handleDiscordRateLimitation() {
}
exports.handleDiscordRateLimitation = handleDiscordRateLimitation;
//# sourceMappingURL=util.js.map