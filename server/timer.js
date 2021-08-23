window.addEventListener("load", init);
let startTimestamp = Date.now();
let timerDiv;
let intervalID;
function init() {
    if (startTimestamp == undefined) {
        startTimestamp = Date.now();
        console.log("timestamp was null");
    }
    timerDiv = document.getElementById("timer");
    updateTimer();
    intervalID = setInterval(updateTimer, 1000);
}
function updateTimer() {
    let minutes = Math.floor((20 * 60 * 1000 + startTimestamp - Date.now()) / (60 * 1000));
    let seconds = Math.floor((20 * 60 * 1000 + startTimestamp - Date.now()) / 1000 % 60);
    if (minutes < 0 || seconds < 0) {
        clearInterval(intervalID);
        minutes = 0;
        seconds = 0;
        document.getElementsByTagName("button")[0].disabled = true;
        document.getElementsByTagName("button")[0].innerHTML = "Time ran out. Please start a new session.";
    }
    let minStr = (minutes / 9 > 1) ? minutes.toString() : "0" + minutes.toString();
    let secStr = (seconds / 9 > 1) ? seconds.toString() : "0" + seconds.toString();
    timerDiv.innerHTML = `${minStr}:${secStr}`;
    if (minutes < 4) {
        timerDiv.style.backgroundColor = "#ebc85d";
    }
    if (minutes < 1) {
        timerDiv.style.backgroundColor = "#e5554e";
    }
}
