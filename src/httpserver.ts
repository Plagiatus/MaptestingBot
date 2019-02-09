import * as Http from "http";
import * as Url from "url";
import {TestingSession, Utils} from "./utils";
import { test } from "./commands/test";
import { data, client } from "./main";
import { Guild } from "discord.js";

export class SessionStarter {
    port: number = process.env.PORT;
    server: Http.Server = Http.createServer();


    constructor() {
        console.log("Http Server starting");
        if (this.port == undefined)
            this.port = 8100;
        this.server.addListener("listening", this.handleListen.bind(this));
        this.server.addListener("request", this.handleRequest.bind(this));
        this.server.listen(this.port);
    }

    handleListen(): void {
        console.log("Listening on port: " + this.port);
    }


    handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): void {
        console.log("Request received: " + _request.url);

        let query: AssocStringString = Url.parse(_request.url, true).query;
        var sessionid: number = parseInt(query["id"]);
        if (!sessionid) {
            this.respond(_response, "something went wrong, please retry.");
        } else {
            this.respond(_response, "that looks like it worked.")
            let test: TestingSession = JSON.parse(JSON.stringify(query));
            console.log(data.waitingSessions);
            for(let s of data.waitingSessions.values()){
                console.log(s.id,test.id);
                if(s.id == test.id){
                    let sess: TestingSession = {
                        additionalInfo : test.additionalInfo,
                        endTimestamp : Infinity,
                        startTimestamp: Date.now(),
                        hostID: s.hostID,
                        id: s.id,
                        ip: test.ip,
                        mapDescription: test.mapDescription,
                        mapTitle: test.mapTitle,
                        maxParticipants: test.maxParticipants,
                        platform: test.platform,
                        ressourcepack: test.ressourcepack,
                        setupTimestamp: s.id,
                        state: "running",
                        category: test.category,
                        version: test.version,
                        guild: s.guild,
                    }
                    data.waitingSessions.splice(data.waitingSessions.indexOf(s),1);
                    data.runningSessions.push(sess);
                    sess.guild.defaultChannel.send(Utils.SessionToEmbed(sess));
                }
            }
        }


        // findCallback is an inner function so that _response is in scope
        function findCallback(json: string): void {
            this.respond(_response, json);
        }
    }
    respond(_response: Http.ServerResponse, _text: string): void {
        //console.log("Preparing response: " + _text);
        _response.setHeader("Access-Control-Allow-Origin", "*");
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.write(_text);
        _response.end();
    }
}





interface AssocStringString {
    [key: string]: string;
}