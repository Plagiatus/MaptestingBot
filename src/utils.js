"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./commands/command");
const config_json_1 = require("./config.json");
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
    static getLevelFromXP(xp) {
        let level = 0;
        for (let i = 0; i < config_json_1.xpSettings.levels.length; i++) {
            if (xp >= config_json_1.xpSettings.levels[i].minXP) {
                level = i;
            }
        }
        return level;
    }
    static getLevelColor(level) {
        return config_json_1.xpSettings.levels[level].color;
    }
    static getLevelImage(level) {
        return config_json_1.xpSettings.levels[level].img;
    }
}
exports.Utils = Utils;
