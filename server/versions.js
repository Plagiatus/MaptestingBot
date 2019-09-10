window.addEventListener("load", getVersions);
let versions = [];
function displayVersions() {
    let version = document.getElementById("version");
    version.innerHTML = "";
    let oldest = 9;
    let prevMajor = "";
    let optGroup;
    for (let i = 0; i < versions.length; i++) {
        if (versions[i].type == "release") {
            let v = versions[i].id.split(".");
            if (+v[1] < oldest)
                break;
            if (v[1] != prevMajor) {
                optGroup = document.createElement("optgroup");
                optGroup.label = v[0] + "." + v[1];
                prevMajor = v[1];
                version.appendChild(optGroup);
            }
            let option = document.createElement("option");
            option.innerText = versions[i].id;
            option.value = versions[i].id;
            optGroup.appendChild(option);
        }
    }
}
function getVersions() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://launchermeta.mojang.com/mc/game/version_manifest.json");
    xhr.addEventListener("readystatechange", foundVersions);
    xhr.send();
}
function foundVersions(_e) {
    let xhr = _e.target;
    if (xhr.readyState == XMLHttpRequest.DONE) {
        versions = JSON.parse(xhr.response).versions;
        displayVersions();
    }
}
