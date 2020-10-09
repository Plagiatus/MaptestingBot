import { Database } from "../src/database";
import { MongoUser, Report } from "../src/utils.js";

let db: Database = new Database(async ()=>{
  let users: MongoUser[] = await db.getAll();
  let activePlayers: number = 0;
  let totalSessions: number = 0;
  let totalSessionsJoined: number = 0;
  let totalHostedSessionDuration: number = 0;
  let totalSessionDuration: number = 0;
  for(let u of users){
    if(u.sessionsHosted <= 0 && u.sessionsJoined <= 0) continue;
    activePlayers++;
    totalSessions += u.sessionsHosted;
    totalSessionsJoined += u.sessionsJoined;
    totalHostedSessionDuration += u.hostedSessionsDuration;
    totalSessionDuration += u.joinedSessionsDuration + u.hostedSessionsDuration;
  }
  console.log(`
Registered users: ${users.length}
Of those ${activePlayers} participated in at least one session. (${(activePlayers * 100 / users.length).toFixed(2)}%)
Total amount of sessions: ${totalSessions}
Total sessions duration: ${totalHostedSessionDuration.toFixed(2)} Minutes
==============================================
Total amount of time of people being in sessions: ${totalSessionDuration.toFixed(2)} Minutes
That is an average of ${(totalSessionDuration / users.length).toFixed(2)} Minutes per registered Player.
That is an average of ${(totalSessionDuration / activePlayers).toFixed(2)} Minutes per active Player.
-----------------------------
The average session lasts ${(totalHostedSessionDuration / totalSessions).toFixed(2)} Minutes.
-----------------------------
People joined a total of ${totalSessionsJoined} sessions, which is an average of ${(totalSessionsJoined / totalSessions).toFixed(1)} per session.
`)
});
