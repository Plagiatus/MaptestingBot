"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mongo = require("mongodb");
const config_json_1 = require("./config.json");
class Database {
    constructor(callback) {
        this.starting = false;
        this.started = false;
        this.databaseURL = `mongodb://${config_json_1.dbuser}:${config_json_1.dbpass}@ds127115.mlab.com:27115/maptestingserver`;
        this.databaseName = "maptestingserver";
        console.debug("[DATABASE] starting");
        this.connect(callback);
    }
    connect(callback) {
        if (!this.starting) {
            this.starting = true;
            console.debug("[DATABASE] Connecting....");
            Mongo.MongoClient.connect(this.databaseURL, (_e, _db) => {
                if (_e) {
                    console.log("[DATABASE] Unable to connect, error: ", _e);
                    this.starting = false;
                }
                else {
                    console.info("[DATABASE] connected");
                    this.db = _db.db(this.databaseName);
                    this.users = this.db.collection("users");
                    this.permittedUsers = this.db.collection("permitted");
                    this.started = true;
                    callback();
                }
            });
        }
    }
    insertUser(_doc) {
        // try insertion then activate callback "handleInsert"
        this.users.findOne({ "discordID": _doc.discordID }).then(result => {
            //found object, so we need to update it.
            if (result) {
                this.users.findOneAndUpdate(result, { $set: _doc }).catch((reason) => console.log(reason));
            }
            //haven't found object, so we need to create a new one.
            else {
                this.users.insertOne(_doc);
            }
        });
    }
    getUser(userID, callback) {
        this.users.find({ "discordID": userID }).limit(1).next((_err, result) => {
            if (result) {
                let mu = result;
                callback(mu);
            }
            else {
                let mu = {
                    discordID: userID,
                    experience: 0,
                    hostedSessionsDuration: 0,
                    joinedSessionsDuration: 0,
                    lastPing: 0,
                    mcBedrockIGN: null,
                    mcJavaIGN: null,
                    muted: 0,
                    sessionsHosted: 0,
                    sessionsJoined: 0
                };
                this.insertUser(mu);
                callback(mu);
            }
        });
    }
    loadPermissions(callback) {
    }
    getPermittedUsers(guildID, callback) {
        let c = this.permittedUsers.find({ "guildID": guildID });
        c.toArray((_e, arr) => {
            if (_e)
                console.log(_e);
            else
                callback(arr);
        });
    }
    promoteUser(guildID, userID) {
        // try insertion then activate callback "handleInsert"
        this.permittedUsers.findOne({ "guildID": guildID, "userID": userID }).then(result => {
            //found object, so we need to update it.
            if (result) {
                // this.permittedUsers.findOneAndUpdate(result, { $set: _doc }).catch((reason) => console.log(reason));
            }
            //haven't found object, so we need to create a new one.
            else {
                this.permittedUsers.insertOne({ "guildID": guildID, "userID": userID });
            }
        });
    }
    demoteUser(guildID, userID) {
        this.permittedUsers.findOneAndDelete({ "guildID": guildID, "userID": userID });
    }
}
exports.Database = Database;
function handleInsert(_e) {
    // console.log("Database insertion returned -> " + _e);
}
