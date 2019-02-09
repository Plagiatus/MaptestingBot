"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const main_1 = require("./main");
class SessionHandler {
    constructor() {
        this.sessionChannels = new Map();
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
        let author;
        session.guild.fetchMember(session.hostID).then(u => {
            author = u.user;
            main_1.db.getUser(author.id, gotMU);
            function gotMU(mu) {
                session.guild.defaultChannel.send("New testing session started. Klick to join");
                session.guild.defaultChannel.send(utils_1.Utils.SessionToListingEmbed(session, author, mu));
            }
        });
    }
}
exports.SessionHandler = SessionHandler;
