import * as Mongo from "mongodb";
import { dbuser, dbpass } from "./config.json"
import { MongoUser } from "./utils.js";



//TODO: Make this not start twice!

console.log("Database starting");

let databaseURL: string = `mongodb://${dbuser}:${dbpass}@ds127115.mlab.com:27115/maptestingserver`;
let databaseName: string = "maptestingserver";

let db: Mongo.Db;
let users: Mongo.Collection;
let started = false;

if (!started)
    Mongo.MongoClient.connect(databaseURL, handleConnect);

function handleConnect(_e: Mongo.MongoError, _db: Mongo.Db): void {
    if (_e)
        console.log("Unable to connect to database, error: ", _e);
    else {
        console.log("Connected to database!");
        db = _db.db(databaseName);
        users = db.collection("users");
        started = true;
    }
}


export function insertUser(_doc: MongoUser): void {
    // try insertion then activate callback "handleInsert"
    users.findOne({ "discordID": _doc.discordID }).then(result => {

        //found object, so we need to update it.
        if (result) {
            users.findOneAndUpdate(result, { $set: _doc }).catch((reason) => console.log(reason));
        }
        //haven't found object, so we need to create a new one.
        else {
            users.insertOne(_doc);
        }
    });
}

export function getUser(userID: string, callback: Function) {
    users.find({ "discordID": userID }).limit(1).next((_err, result) => {
        if (result) {
            console.log("if", result);
            let mu: MongoUser = <MongoUser>result;
            callback(mu);
        } else {
            console.log("else");
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
            insertUser(mu);
            callback(mu);
        }
    });
}


function handleInsert(_e: Mongo.MongoError): void {
    console.log("Database insertion returned -> " + _e);
}