import * as Discord from "discord.js";
import { TestingSession, Utils, MongoUser } from "./utils";
import { data, db, client } from "./main";
import { stringify } from "querystring";

export class SessionManager {
    listing: Map<string, Discord.TextChannel>;
    sessionChannels: Map<number, Discord.CategoryChannel>;
    sessionMessages: Map<number, Map<string,Discord.Message>>;
    sessionUsers: Map<number,Discord.User>

    constructor() {
        this.sessionChannels = new Map<number, Discord.CategoryChannel>();
        this.listing = new Map<string, Discord.TextChannel>();
        for (let g of client.guilds.values()) {
            for (let c of g.channels.values()) {
                if (c.type == "text" && c.name == "listing") {
                    this.listing.set(g.id, <Discord.TextChannel>c);
                }
            }
        }
        this.sessionMessages = new Map<number, Map<string,Discord.Message>>();
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
        
        this.sessionMessages.set(session.id, new Map<string,Discord.Message>());

        session.guild.fetchMember(session.hostID).then(u => {
            let author: Discord.User = u.user;
            db.getUser(author.id, mu => {
                this.listing.get(session.guild.id).send("New testing session started. Click to join");
                this.listing.get(session.guild.id).send(Utils.SessionToListingEmbed(session, author, mu));
            });
        });
    }
}