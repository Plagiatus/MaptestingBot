window.addEventListener("load", init);

let startTimestamp = Date.now();
let timerDiv: HTMLDivElement;

function init(){
    if(startTimestamp == undefined){
        startTimestamp = Date.now();
        console.log("timestamp was null");
    }

    timerDiv = <HTMLDivElement>document.getElementById("timer");
    updateTimer();
    setInterval(updateTimer, 1000);
}

function updateTimer(){
    let minutes = Math.floor((600000 + startTimestamp - Date.now())/60000);
    let seconds = Math.floor((600000 + startTimestamp - Date.now())/1000 % 60);
    if(minutes < 0 || seconds < 0){
        minutes = 0;
        seconds = 0;
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