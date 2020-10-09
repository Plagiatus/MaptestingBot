"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/database");
let db = new database_1.Database(() => __awaiter(void 0, void 0, void 0, function* () {
    let users = yield db.getAll();
    let activePlayers = 0;
    let totalSessions = 0;
    let totalSessionsJoined = 0;
    let totalHostedSessionDuration = 0;
    let totalSessionDuration = 0;
    for (let u of users) {
        if (u.sessionsHosted <= 0 && u.sessionsJoined <= 0)
            continue;
        activePlayers++;
        totalSessions += u.sessionsHosted;
        totalSessionsJoined += u.sessionsJoined;
        totalHostedSessionDuration += u.hostedSessionsDuration;
        totalSessionDuration += u.joinedSessionsDuration + u.hostedSessionsDuration;
    }
    console.log(`
Registered Users: ${users.length}
Of those ${activePlayers} participated in at least one session. (${(activePlayers * 100 / users.length).toFixed(2)}%)
Total amount of Sessions: ${totalSessions}
Total Sessions Duration: ${totalHostedSessionDuration.toFixed(2)} Minutes
==============================================
Total amount of time of people being in sessions: ${totalSessionDuration.toFixed(2)} Minutes
That is an average of ${(totalSessionDuration / users.length).toFixed(2)} Minutes per registered Player.
That is an average of ${(totalSessionDuration / activePlayers).toFixed(2)} Minutes per active Player.
-----------------------------
The average session lasts ${(totalHostedSessionDuration / totalSessions).toFixed(2)} Minutes.
-----------------------------
People joined a total of ${totalSessionsJoined} sessions, which is an average of ${(totalSessionsJoined / totalSessions).toFixed(1)}.
`);
}));
