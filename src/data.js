"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
class Data {
    constructor() {
        this.initalizePermittedUsers();
    }
    initalizePermittedUsers() {
        this.permittedUsers = new Map();
        for (let g of main_1.client.guilds.values()) {
            main_1.db.getPermittedUsers(g.id, (list) => {
                for (let u of list) {
                    if (!this.permittedUsers.has(u.guildID)) {
                        this.permittedUsers.set(u.guildID, []);
                    }
                    this.permittedUsers.get(u.guildID).push(u.userID);
                }
            });
        }
    }
    isUserPermitted(guildID, userID) {
        if (this.permittedUsers.has(guildID)) {
            if (this.permittedUsers.get(guildID).indexOf(userID) > -1)
                return true;
        }
        return false;
    }
    promoteUser(guildID, userID) {
        main_1.db.promoteUser(guildID, userID);
        if (!this.permittedUsers.has(guildID)) {
            this.permittedUsers.set(guildID, []);
        }
        if (this.permittedUsers.get(guildID).indexOf(userID) > -1) {
            return false;
        }
        this.permittedUsers.get(guildID).push(userID);
        return true;
    }
    demoteUser(guildID, userID) {
        main_1.db.demoteUser(guildID, userID);
        if (!this.permittedUsers.has(guildID)) {
            this.permittedUsers.set(guildID, []);
            return false;
        }
        if (this.permittedUsers.get(guildID).indexOf(userID) > -1) {
            this.permittedUsers.get(guildID).splice(this.permittedUsers.get(guildID).indexOf(userID), 1);
            return true;
        }
        return false;
    }
}
exports.Data = Data;
