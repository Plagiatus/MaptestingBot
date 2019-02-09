import * as Mongo from "mongodb";
import { dbuser, dbpass } from "./config.json"
import { MongoUser } from "./utils.js";
import { connect } from "net";


export class Database {

    databaseURL: string;
    databaseName: string;

    db: Mongo.Db;
    users: Mongo.Collection;
    permittedUsers: Mongo.Collection;
    starting: boolean = false;
    started: boolean = false;

    constructor(callback?: Function) {
        this.databaseURL = `mongodb://${dbuser}:${dbpass}@ds127115.mlab.com:27115/maptestingserver`;
        this.databaseName = "maptestingserver";
        console.debug("[DATABASE] starting");
        this.connect(callback);
    }

    private connect(callback: Function): void {
        if (!this.starting) {
            this.starting = true;
            console.debug("[DATABASE] Connecting....");
            Mongo.MongoClient.connect(this.databaseURL, (_e: Mongo.MongoError, _db: Mongo.Db) => {
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

    insertUser(_doc: MongoUser): void {
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

    getUser(userID: string, callback: Function) {
        this.users.find({ "discordID": userID }).limit(1).next((_err, result) => {
            if (result) {
                let mu: MongoUser = <MongoUser>result;
                callback(mu);
            } else {
                let mu: MongoUser = {
                    discordID: userID,
                    experience: 0,
                    hostedSessionsDuration: 0,
                    joinedSessionsDuration: 0,
                    lastPing: 0,
                    mcBedrockIGN: null,
                    mcJavaIGN: null,
                    muted: false,
                    sessionsHosted: 0,
                    sessionsJoined: 0
                }
                this.insertUser(mu);
                callback(mu);
            }
        });
    }

    loadPermissions(callback: Function) {

    }

    getPermittedUsers(guildID: string, callback) {
        let c: Mongo.Cursor = this.permittedUsers.find({ "guildID": guildID });
        c.toArray((_e, arr) => {
            if(_e) console.log(_e);
            else callback(arr);
        });
    }

    promoteUser(guildID: string, userID: string){
        // try insertion then activate callback "handleInsert"
        this.permittedUsers.findOne({"guildID":guildID,"userID":userID}).then(result => {

            //found object, so we need to update it.
            if (result) {
                // this.permittedUsers.findOneAndUpdate(result, { $set: _doc }).catch((reason) => console.log(reason));
            }
            //haven't found object, so we need to create a new one.
            else {
                this.permittedUsers.insertOne({"guildID":guildID,"userID":userID});
            }
        });
    }

    demoteUser(guildID: string, userID: string){
         this.permittedUsers.findOneAndDelete({"guildID":guildID,"userID":userID});
    }
}



function handleInsert(_e: Mongo.MongoError): void {
    // console.log("Database insertion returned -> " + _e);
}