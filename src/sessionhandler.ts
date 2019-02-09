import * as Discord from "discord.js";
import { TestingSession, Utils, MongoUser } from "./utils";
import { data, db } from "./main";

export class SessionHandler {
    listing: Discord.TextChannel;
    sessionChannels: Map<number, Discord.CategoryChannel>;

    constructor() {
        this.sessionChannels = new Map<number, Discord.CategoryChannel>();
    }

    startNew(session: TestingSession) {
        for (let s of data.waitingSessions.values()) {
            if (s.id == session.id) {
                data.waitingSessions.splice(data.waitingSessions.indexOf(s), 1);
            }
        }
        if (session.maxParticipants <= 0)
            session.maxParticipants = Infinity;
        data.runningSessions.push(session);
        let author: Discord.User;
        session.guild.fetchMember(session.hostID).then(u => {
            author = u.user;
            db.getUser(author.id, gotMU);
            function gotMU(mu: MongoUser) {
                session.guild.defaultChannel.send("New testing session started. Klick to join");
                session.guild.defaultChannel.send(Utils.SessionToListingEmbed(session, author, mu));
            }
        });
    }
}