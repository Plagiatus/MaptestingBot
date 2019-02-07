"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./commands/command");
class Utils {
    static removeMessage(message, delay = 0) {
        setTimeout(message.delete, delay);
    }
    static findCommandWithAlias(alias) {
        if (command_1.commands.has(alias))
            return command_1.commands.get(alias);
        for (let c of command_1.commands) {
            if (c[1].aliases.indexOf(alias) > -1)
                return c[1];
        }
        return null;
    }
}
exports.Utils = Utils;
