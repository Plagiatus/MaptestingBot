"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mongo = require("mongodb");
const config_json_1 = require("./config.json");
console.log("Database starting");
let databaseURL = `mongodb://${config_json_1.dbuser}:${config_json_1.dbpass}@ds127115.mlab.com:27115/maptestingserver`;
let databaseName = "maptestingserver";
let db;
let users;
Mongo.MongoClient.connect(databaseURL, handleConnect);
function handleConnect(_e, _db) {
    console.log("Connected to db");
    if (_e)
        console.log("Unable to connect to database, error: ", _e);
    else {
        console.log("Connected to database!");
        db = _db.db(databaseName);
        users = db.collection("users");
    }
}
function insert(_doc) {
    // try insertion then activate callback "handleInsert"
    users.insertOne(_doc, handleInsert);
}
exports.insert = insert;
function handleInsert(_e) {
    console.log("Database insertion returned -> " + _e);
}
