"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = void 0;
const main_1 = require("./main");
class Data {
    constructor() {
        this.initializePermittedUsers();
        this.initializePermittedRoles();
        this.initializeEmojis();
        this.initializeMutedRoles();
        this.initializelevelRoles();
    }
    destructor() {
    }
    initializelevelRoles() {
        this.levelRoles = new Map();
        for (let g of main_1.client.guilds.values()) {
            this.levelRoles.set(g.id, new Map());
            let found = false;
            for (let r of g.roles.values()) {
                if (r.name.includes("Level")) {
                    if (r.name.includes("1")) {
                        this.levelRoles.get(g.id).set(1, r);
                    }
                    if (r.name.includes("2")) {
                        this.levelRoles.get(g.id).set(2, r);
                    }
                    if (r.name.includes("3")) {
                        this.levelRoles.get(g.id).set(3, r);
                    }
                    if (r.name.includes("4")) {
                        this.levelRoles.get(g.id).set(4, r);
                    }
                    if (r.name.includes("5")) {
                        this.levelRoles.get(g.id).set(5, r);
                    }
                    if (r.name.includes("Master") || r.name.includes("6")) {
                        this.levelRoles.get(g.id).set(6, r);
                    }
                    found = true;
                }
            }
            if (!found) {
                g.createRole({ name: "Master Level 🔥", mentionable: false, color: "#ff7272", hoist: true }).then(r => {
                    this.levelRoles.get(g.id).set(6, r);
                });
                g.createRole({ name: "Level 5 💎", mentionable: false, color: "#2ad3e2", hoist: true }).then(r => {
                    this.levelRoles.get(g.id).set(5, r);
                });
                g.createRole({ name: "Level 4 ✨", mentionable: false, color: "#c7118d" }).then(r => {
                    this.levelRoles.get(g.id).set(4, r);
                });
                g.createRole({ name: "Level 3 ☀", mentionable: false, color: "#ddb825" }).then(r => {
                    this.levelRoles.get(g.id).set(3, r);
                });
                g.createRole({ name: "Level 2", mentionable: false, color: "#00c03d" }).then(r => {
                    this.levelRoles.get(g.id).set(2, r);
                });
                g.createRole({ name: "Level 1", mentionable: false, color: "#7693e0" }).then(r => {
                    this.levelRoles.get(g.id).set(1, r);
                });
            }
        }
    }
    initializeMutedRoles() {
        this.disableNotificationsRole = new Map();
        for (let g of main_1.client.guilds.values()) {
            let found = false;
            for (let r of g.roles.values()) {
                if (r.name == "Notifications Disabled 🔕") {
                    found = true;
                    this.disableNotificationsRole.set(g.id, r);
                }
            }
            if (!found) {
                g.createRole({ name: "Notifications Disabled 🔕", mentionable: false }).then(r => {
                    this.disableNotificationsRole.set(g.id, r);
                });
            }
        }
    }
    initializeEmojis() {
        this.usedEmojis = new Map();
        for (let g of main_1.client.guilds.values()) {
            this.usedEmojis.set(g.id, new Map());
            for (let e of g.emojis.values()) {
                if (e.name == "join")
                    this.usedEmojis.get(g.id).set("join", e);
                if (e.name == "joined")
                    this.usedEmojis.get(g.id).set("joined", e);
                if (e.name == "left")
                    this.usedEmojis.get(g.id).set("left", e);
            }
        }
    }
    initializePermittedUsers() {
        this.permittedUsers = new Map();
        for (let g of main_1.client.guilds.values()) {
            this.permittedUsers.set(g.id, []);
            for (let m of g.members.values()) {
                if (m.hasPermission(["MANAGE_CHANNELS", "MANAGE_MESSAGES"]) && !m.user.bot) {
                    this.permittedUsers.get(g.id).push(m.id);
                }
            }
        }
        // for (let g of client.guilds.values()) {
        //     db.getPermittedUsers(g.id, (list) => {
        //         for (let u of list) {
        //             if (!this.permittedUsers.has(u.guildID)) {
        //                 this.permittedUsers.set(u.guildID, []);
        //             }
        //             this.permittedUsers.get(u.guildID).push(u.userID);
        //         }
        //     });
        // }
    }
    initializePermittedRoles() {
        this.permittedRoles = new Map();
        for (let g of main_1.client.guilds.values()) {
            this.permittedRoles.set(g.id, []);
            for (let r of g.roles.values()) {
                if (r.hasPermission(["MANAGE_CHANNELS", "MANAGE_MESSAGES"])) {
                    this.permittedRoles.get(g.id).push(r.id);
                }
            }
        }
    }
    isUserPermitted(guildID, userID) {
        if (this.permittedUsers.has(guildID)) {
            if (this.permittedUsers.get(guildID).indexOf(userID) > -1)
                return true;
        }
        return false;
    }
}
exports.Data = Data;
