import * as Mongo from "mongodb";
import * as SConfig from "./secretconfig.json"
import { MongoUser, Report } from "./utils.js";
import { User } from "discord.js";
import { client } from "./main.js";


export class Database {

	databaseURL: string;
	databaseName: string;

	db: Mongo.Db;
	users: Mongo.Collection;
	reports: Mongo.Collection;
	kicks: Mongo.Collection;
	starting: boolean = false;
	started: boolean = false;

	constructor(callback?: Function) {
		this.databaseURL = `mongodb+srv://${SConfig.dbuser}:${SConfig.dbpass}@maptestingserver.a8x7m.mongodb.net/maptestingserver?retryWrites=true&w=majority`;
		// this.databaseURL = `mongodb://${SConfig.dbuser}:${SConfig.dbpass}@ds127115.mlab.com:27115/maptestingserver`;
		this.databaseName = "maptestingserver";
		console.debug("[DATABASE] starting");
		this.connect(callback);
	}

	private connect(callback: Function): void {
		if (!this.starting) {
			this.starting = true;
			console.debug("[DATABASE] Connecting....");
			Mongo.MongoClient.connect(this.databaseURL, { useUnifiedTopology: true }, (_e: Mongo.MongoError, _db: Mongo.Db) => {
				if (_e) {
					console.log("[DATABASE] Unable to connect, error: ", _e);
					this.starting = false;
				}
				else {
					console.info("[DATABASE] connected");
					this.db = _db.db(this.databaseName);
					this.users = this.db.collection("users");
					this.reports = this.db.collection("reports");
					this.kicks = this.db.collection("kicks");
					this.started = true;
					callback();
				}
			});
		}
	}

	async insertUser(_doc: MongoUser): Promise<void> {
		// try insertion then activate callback "handleInsert"
		let resultCursor: Mongo.Cursor = await this.users.find({ "discordID": _doc.discordID }).limit(1);
		let results = await resultCursor.toArray();
		let result = results[0];

		//found object, so we need to update it.
		if (result) {
			this.users.findOneAndUpdate(result, { $set: _doc }).catch((reason) => console.log(reason));
		}
		//haven't found object, so we need to create a new one.
		else {
			this.users.insertOne(_doc);
		}
	}

	async getUser(userID: string, userName: string): Promise<MongoUser> {
		let result: Mongo.Cursor = await this.users.find({ "discordID": userID })//.limit(1).next((_err, result) => {
		let resultArray: MongoUser[] = <MongoUser[]>await result.limit(1).toArray();
		if (resultArray.length > 0) {
			let mu: MongoUser = resultArray[0];
			if (!mu.discordName) {
				mu.discordName = userName;
				await this.insertUser(mu);
			}
			mu.discordName = userName;
			return mu;
		} else {
			let mu: MongoUser = {
				discordName: userName,
				discordID: userID,
				experience: 0,
				hostedSessionsDuration: 0,
				joinedSessionsDuration: 0,
				lastPing: Infinity,
				mcBedrockIGN: null,
				mcJavaIGN: null,
				muted: 0,
				sessionsHosted: 0,
				sessionsJoined: 0
			}
			this.insertUser(mu);
			return mu;
		}
	}

	async getAll(): Promise<MongoUser[]> {
		let result: Mongo.Cursor = await this.users.find();
		let resultArray: MongoUser[] = <MongoUser[]>await result.toArray();
		return resultArray;
	}


	kick(reporter: User, user: User, reason: string) {
		console.log(`[DATABASE] ${reporter.tag} kicked ${user.tag} for ${reason}`);
		this.kicks.find({ "uID": user.id }).limit(1).next((_err, result) => {
			let r: Report;
			if (result) {
				r = <Report>result;
				r.reasons.push({ reporter: reporter.tag, reason: reason, date: new Date(Date.now()) });
				this.kicks.findOneAndUpdate({ "uID": user.id }, { $set: r }).catch((reason) => console.log(reason));
			} else {
				r = {
					uID: user.id,
					username: user.tag,
					reasons: [{ reporter: reporter.tag, reason: reason, date: new Date(Date.now()) }]
				}
				this.kicks.insertOne(r);
			}
		});
	}

	report(reporter: User, user: User, reason: string) {
		console.log(`[DATABASE] ${reporter.tag} reported ${user.tag} for ${reason}`);
		this.reports.find({ "uID": user.id }).limit(1).next((_err, result) => {
			let r: Report;
			if (result) {
				r = <Report>result;
				r.reasons.push({ reporter: reporter.tag, reason: reason, date: new Date(Date.now()) });
				this.reports.findOneAndUpdate({ "uID": user.id }, { $set: r }).catch((reason) => console.log(reason));
			} else {
				r = {
					uID: user.id,
					username: user.tag,
					reasons: [{ reporter: reporter.tag, reason: reason, date: new Date(Date.now()) }]
				}
				this.reports.insertOne(r);
			}
		});
	}

	async getReports(user?: User): Promise<Report[]> {
		let reportArray: Report[] = [];
		if (user) {
			reportArray = await this.reports.find({ "uID": user.id }).limit(1).toArray();
		} else {
			reportArray = await this.reports.find().toArray();
		}
		return reportArray;
	}

	// getPermittedUsers(guildID: string, callback) {
	//     let c: Mongo.Cursor = this.permittedUsers.find({ "guildID": guildID });
	//     c.toArray((_e, arr) => {
	//         if(_e) console.log(_e);
	//         else callback(arr);
	//     });
	// }

	// promoteUser(guildID: string, userID: string){
	//     // try insertion then activate callback "handleInsert"
	//     this.permittedUsers.findOne({"guildID":guildID,"userID":userID}).then(result => {

	//         //found object, so we need to update it.
	//         if (result) {
	//             // this.permittedUsers.findOneAndUpdate(result, { $set: _doc }).catch((reason) => console.log(reason));
	//         }
	//         //haven't found object, so we need to create a new one.
	//         else {
	//             this.permittedUsers.insertOne({"guildID":guildID,"userID":userID});
	//         }
	//     });
	// }

	// demoteUser(guildID: string, userID: string){
	//      this.permittedUsers.findOneAndDelete({"guildID":guildID,"userID":userID});
	// }


}



function handleInsert(_e: Mongo.MongoError): void {
	// console.log("Database insertion returned -> " + _e);
}