"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const main_1 = require("./main");
class SessionManager {
    constructor() {
        this.sessionChannels = new Map();
        this.listing = new Map();
        for (let g of main_1.client.guilds.values()) {
            for (let c of g.channels.values()) {
                if (c.type == "text" && c.name == "listing") {
                    this.listing.set(g.id, c);
                }
            }
        }
        this.sessionMessages = new Map();
    }
    startNew(session) {
        for (let s of main_1.data.waitingSessions.values()) {
            if (s.id == session.id) {
                main_1.data.waitingSessions.splice(main_1.data.waitingSessions.indexOf(s), 1);
            }
        }
        if (session.maxParticipants <= 0)
            session.maxParticipants = Infinity;
        main_1.data.runningSessions.push(session);
        this.sessionMessages.set(session.id, new Map());
        session.guild.fetchMember(session.hostID).then(u => {
            let author = u.user;
            main_1.db.getUser(author.id, mu => {
                this.listing.get(session.guild.id).send("New testing session started. Click to join");
                this.listing.get(session.guild.id).send(utils_1.Utils.SessionToListingEmbed(session, author, mu));
            });
        });
    }
}
exports.SessionManager = SessionManager;
