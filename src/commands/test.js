"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const main_1 = require("../main");
exports.test = {
    name: "test",
    aliases: ["t"],
    description: "Just a test command.",
    usage: "...idk?",
    globalCooldown: 0,
    individualCooldown: 30,
    guildOnly: true,
    grantedOnly: false,
    needsArgs: false,
    hidden: true,
    channel: ["bot"],
    execute: function test(message, args) {
        main_1.db.getReports().then(r => {
            console.log(r);
        }).catch(e => {
            console.log(e);
        });
        return true;
    }
};
// db.getUser(message.author.id, mu => {
//    mu.lastPing = 0;
//    db.insertUser(mu);
// });
// let session: TestingSession = {
//     endTimestamp: Infinity,
//     hostID: message.author.id,
//     id: Math.floor(Math.random() * 10000),
//     additionalInfo: "",
//     ip: "",
//     mapDescription: "",
//     mapTitle: "",
//     maxParticipants: Infinity,
//     platform: null,
//     resourcepack: "",
//     startTimestamp: Infinity,
//     state: "preparing",
//     category: null,
//     version: null,
//     guild: message.guild,
//     setupTimestamp: Date.now(),
//     ping: false
// }
// let role: Role;
// message.guild.createRole({ name: "host-" + session.id, color: "#0eb711", hoist: true, mentionable: false }).then(r => {
//     role = r;
//     message.guild.members.get(message.author.id).addRole(role);    
//     message.guild.createChannel("session-" + session.id, "category", [{
//         id: message.guild.id,
//         deny: ["VIEW_CHANNEL", "READ_MESSAGES"]
//     },
//     {
//         id: client.user.id,
//         allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS"]
//     }, {
//         id: role.id,
//         allow: ["VIEW_CHANNEL", "READ_MESSAGES"]
//     }
//     ])
//         .then(category => {
//             category.guild.createChannel("sessionsetup", "text", [{
//                 id: message.guild.id,
//                 deny: ["VIEW_CHANNEL", "READ_MESSAGES"]
//             },
//             {
//                 id: client.user.id,
//                 allow: ["ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "MANAGE_MESSAGES", "MANAGE_CHANNELS"]
//             }, {
//                 id: role.id,
//                 allow: ["VIEW_CHANNEL", "READ_MESSAGES"]
//             }]).then(c => {
//                 let tc : TextChannel = (<TextChannel>c);
//                 tc.setParent(category);
//                 tc.sendMessage(":octagonal_sign: Abort the setup").then(m => {
//                     (<Message>m).react("🛑").then(r => {
//                         let rc: ReactionCollector = (<Message>m).createReactionCollector(m => {return m.emoji.name == "🛑"});
//                         rc.on("collect", collected =>{
//                             console.log(collected.users.has(message.author.id));
//                         });
//                         let coll: MessageCollector = tc.createMessageCollector(m => true, { time: 60000 });
//                         let sessionSetupProgress: number = 0;
//                         coll.on("end", collected => {
//                             c.delete();
//                             category.delete();
//                             role.delete();
//                         });
//                         coll.on("collect", collected => {
//                             console.log(collected);
//                         });
//                     });
//                 });
//             });
//         });
// });
// return true;
// function filter(m: Message) {
//     return m.content.includes("discord");
// }
/////////////////////////////////getting and changing Users from the db
// db.getUser(message.author.id, callback);
// return true;
// function callback(mu: MongoUser) {
//     if(!mu) return;
//     mu.experience += 100;
//     db.insertUser(mu);
// }
/////////////////// EMBEDS
// message.delete(5000);
// let embed:RichEmbed = new RichEmbed;
// embed.setAuthor(message.author.username, message.author.avatarURL)
// .setTitle("Map Name")
// .setColor("#123456")
// .attachFile("../img/stream.png")
// .setThumbnail("attachment://stream.png")
// .setDescription("asdfjö asökjf asf saö oaöksd asödjksldf aödj asöd asj asdj awj fosdjf aoj dkaöoid aodjf asoidj attachment://black_test.png ");
// message.channel.send(embed);
//////// PINGING USERS
// message.channel.send("args: " + args);
// if (command == "ping")
//     message.channel.send(`Pong! took ${Date.now() - message.createdTimestamp}ms`);
// else if (command == "kick") {
//     // let taggedUser: Discord.User = message.mentions.users
//     message.mentions.users.first().send(message.mentions.users.first().username + " what are you doinng???");
// }
// else if (command == "avatar"){
//     message.reply(message.author.displayAvatarURL);
// }
// message.channel.bulkDelete(5);
