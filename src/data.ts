import { stringify } from "querystring";
import { Client, Role } from "discord.js";
import { client, db, data } from "./main";
import { TestingSession } from "./utils";

export class Data {
    permittedUsers: Map<string, string[]>;
    waitingSessions: TestingSession[];
    runningSessions: TestingSession[];


    constructor() {
        this.initalizePermittedUsers();
        this.waitingSessions = [];
        this.runningSessions = [];
        setInterval(this.checkWaitingSeasons.bind(this), 60000)
    }

    checkWaitingSeasons(){
        for(let i:number = 0; i < this.waitingSessions.length; i++){
            if(this.waitingSessions[i].setupTimestamp < Date.now() - 600000){
                console.log(`[DATAHANDLER] Session #${this.waitingSessions[i].id} has been removed for being idle for too long.`)
                this.waitingSessions.splice(i,1);
                i--;
            }
        }
    }

    
    private initalizePermittedUsers() {
        this.permittedUsers = new Map<string, string[]>();
        for (let g of client.guilds.values()) {
            db.getPermittedUsers(g.id, (list) => {
                for (let u of list) {
                    if (!this.permittedUsers.has(u.guildID)) {
                        this.permittedUsers.set(u.guildID, []);
                    }
                    this.permittedUsers.get(u.guildID).push(u.userID);

                }
            });
        }

    }

    isUserPermitted(guildID: string, userID: string): boolean {
        if (this.permittedUsers.has(guildID)) {
            if (this.permittedUsers.get(guildID).indexOf(userID) > -1)
                return true;
        }
        return false;
    }

    promoteUser(guildID: string, userID: string): boolean {
        db.promoteUser(guildID, userID);
        if (!this.permittedUsers.has(guildID)) {
            this.permittedUsers.set(guildID, []);
        }
        if(this.permittedUsers.get(guildID).indexOf(userID) > -1){
            return false;
        }
        this.permittedUsers.get(guildID).push(userID);
        return true;
    }

    demoteUser(guildID: string, userID: string):boolean {
        db.demoteUser(guildID, userID);
        if (!this.permittedUsers.has(guildID)) {
            this.permittedUsers.set(guildID, []);
            return false;
        }
        if(this.permittedUsers.get(guildID).indexOf(userID) > -1){
            this.permittedUsers.get(guildID).splice(this.permittedUsers.get(guildID).indexOf(userID),1);
            return true;
        }
        return false;

    }
}