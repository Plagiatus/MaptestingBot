"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mongo = require("mongodb");
const config_json_1 = require("./config.json");
//TODO: Make this not start twice!
console.log("Database starting");
let databaseURL = `mongodb://${config_json_1.dbuser}:${config_json_1.dbpass}@ds127115.mlab.com:27115/maptestingserver`;
let databaseName = "maptestingserver";
let db;
let users;
let started = false;
if (!started)
    Mongo.MongoClient.connect(databaseURL, handleConnect);
function handleConnect(_e, _db) {
    if (_e)
        console.log("Unable to connect to database, error: ", _e);
    else {
        console.log("Connected to database!");
        db = _db.db(databaseName);
        users = db.collection("users");
        started = true;
    }
}
function insertUser(_doc) {
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
exports.insertUser = insertUser;
function getUser(userID, callback) {
    users.find({ "discordID": userID }).limit(1).next((_err, result) => {
        if (result) {
            console.log("if", result);
            let mu = result;
            callback(mu);
        }
        else {
            console.log("else");
            let mu = {
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
            };
            insertUser(mu);
            callback(mu);
        }
    });
}
exports.getUser = getUser;
function handleInsert(_e) {
    console.log("Database insertion returned -> " + _e);
}
