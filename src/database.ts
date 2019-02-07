import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";
import { dbuser, dbpass } from "./config.json"
console.log("Database starting");

let databaseURL: string = `mongodb://${dbuser}:${dbpass}@ds127115.mlab.com:27115/maptestingserver`;
let databaseName: string = "maptestingserver";

let db: Mongo.Db;
let users: Mongo.Collection;

Mongo.MongoClient.connect(databaseURL, handleConnect);

function handleConnect(_e: Mongo.MongoError, _db: Mongo.Db): void {
    console.log("Connected to db");
    if (_e)
        console.log("Unable to connect to database, error: ", _e);
    else {
        console.log("Connected to database!");
        db = _db.db(databaseName);
        users = db.collection("users");
    }
}


export function insert(_doc): void {
    // try insertion then activate callback "handleInsert"
    users.insertOne(_doc, handleInsert);
}

function handleInsert(_e: Mongo.MongoError): void {
    console.log("Database insertion returned -> " + _e);
}