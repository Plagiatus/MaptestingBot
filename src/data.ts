import { stringify } from "querystring";
import { Client, Role, Emoji } from "discord.js";
import { client, db, data } from "./main";
import { TestingSession } from "./utils";

export class Data {
    permittedUsers: Map<string, string[]>;
    disableNotificationsRole: Map<string, Role>;
    waitingSessions: TestingSession[];
    runningSessions: TestingSession[];
    usedEmojis: Map<string, Map<string, Emoji>>;
    levelRoles: Map<string, Map<number, Role>>;


    constructor() {
        this.initializePermittedUsers();
        this.waitingSessions = [];
        this.runningSessions = [];
        setInterval(this.checkWaitingSessions.bind(this), 60000)
        this.initializeEmojis();
        this.initializeMutedRoles();
        this.initializelevelRoles();
    }

    checkWaitingSessions() {
        for (let i: number = 0; i < this.waitingSessions.length; i++) {
            if (this.waitingSessions[i].setupTimestamp < Date.now() - 600000) {
                console.log(`[DATAHANDLER] Session #${this.waitingSessions[i].id} has been removed for being idle for too long.`)
                this.waitingSessions.splice(i, 1);
                i--;
            }
        }
    }

    private initializelevelRoles() {
        this.levelRoles = new Map<string, Map<number, Role>>();
        for (let g of client.guilds.values()) {
            this.levelRoles.set(g.id, new Map<number, Role>());
            let found: boolean = false;
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

    private initializeMutedRoles() {
        this.disableNotificationsRole = new Map<string, Role>();
        for (let g of client.guilds.values()) {
            let found: boolean = false;
            for (let r of g.roles.values()) {
                if (r.name == "Notifications Disabled 🔕") {
                    found = true;
                    this.disableNotificationsRole.set(g.id, r);
                }
            }
            if (!found) {
                g.createRole({ name: "Notifications Disabled 🔕", mentionable: false }).then(r => {
                    this.disableNotificationsRole.set(g.id, r);
                })
            }
        }
    }

    private initializeEmojis() {
        this.usedEmojis = new Map<string, Map<string, Emoji>>();
        for (let g of client.guilds.values()) {
            this.usedEmojis.set(g.id, new Map<string, Emoji>());
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

    private initializePermittedUsers() {
        this.permittedUsers = new Map<string, string[]>();
        for (let g of client.guilds.values()) {
            this.permittedUsers.set(g.id, []);
            for (let m of g.members.values()) {
                if (m.hasPermission(["MANAGE_CHANNELS", "MANAGE_MESSAGES"])) {
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

    isUserPermitted(guildID: string, userID: string): boolean {
        if (this.permittedUsers.has(guildID)) {
            if (this.permittedUsers.get(guildID).indexOf(userID) > -1)
                return true;
        }
        return false;
    }

    // promoteUser(guildID: string, userID: string): boolean {
    //     db.promoteUser(guildID, userID);
    //     if (!this.permittedUsers.has(guildID)) {
    //         this.permittedUsers.set(guildID, []);
    //     }
    //     if (this.permittedUsers.get(guildID).indexOf(userID) > -1) {
    //         return false;
    //     }
    //     this.permittedUsers.get(guildID).push(userID);
    //     return true;
    // }

    // demoteUser(guildID: string, userID: string): boolean {
    //     db.demoteUser(guildID, userID);
    //     if (!this.permittedUsers.has(guildID)) {
    //         this.permittedUsers.set(guildID, []);
    //         return false;
    //     }
    //     if (this.permittedUsers.get(guildID).indexOf(userID) > -1) {
    //         this.permittedUsers.get(guildID).splice(this.permittedUsers.get(guildID).indexOf(userID), 1);
    //         return true;
    //     }
    //     return false;

    // }
}