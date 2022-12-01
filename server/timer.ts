window.addEventListener("load", init);

let startTimestamp = Date.now();
let timerDiv: HTMLDivElement;
let intervalID;

function init(){
    let url = new URL(window.location.href);
    if(url.searchParams.has("timestamp")){
        startTimestamp = Number(url.searchParams.get("timestamp"));
    }
    if(startTimestamp == undefined){
        startTimestamp = Date.now();
        console.log("timestamp was null");
    }

    timerDiv = <HTMLDivElement>document.getElementById("timer");
    updateTimer();
    intervalID = setInterval(updateTimer, 1000);
}

function updateTimer(){
    let minutes = Math.floor((20 * 60 * 1000 + startTimestamp - Date.now())/ (60 * 1000));
    let seconds = Math.floor((20 * 60 * 1000 + startTimestamp - Date.now())/ 1000 % 60);
    if(minutes < 0 || seconds < 0){
        clearInterval(intervalID);
        minutes = 0;
        seconds = 0;
        document.getElementsByTagName("button")[0].disabled = true;
        document.getElementsByTagName("button")[0].innerHTML = "Time ran out. Please start a new session.";
    }
    let minStr: string = (minutes / 9 > 1) ? minutes.toString() : "0"+minutes.toString();
    let secStr: string = (seconds / 9 > 1) ? seconds.toString() : "0"+seconds.toString();
    timerDiv.innerHTML = `${minStr}:${secStr}`;

    if(minutes < 4) {
        timerDiv.style.backgroundColor = "#ebc85d";
    }
    if(minutes < 1) {
        timerDiv.style.backgroundColor = "#e5554e";

    }
}