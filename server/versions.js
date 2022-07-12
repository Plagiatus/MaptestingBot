window.addEventListener("load", getVersions);
let versions = [];
function displayVersions() {
    let version = document.getElementById("version");
    let snapshot = document.getElementById("snapshots").checked;
    version.innerHTML = "";
    if (snapshot) {
        displaySnapshotVersions(version);
    }
    else {
        displayReleaseVersions(version);
    }
}
function displayReleaseVersions(_version) {
    let oldest = 7;
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
                _version.appendChild(optGroup);
            }
            let option = document.createElement("option");
            option.innerText = versions[i].id;
            option.value = versions[i].id;
            optGroup.appendChild(option);
        }
    }
}
function displaySnapshotVersions(_version) {
    let max = 40;
    let found = 0;
    for (let i = 0; i < versions.length && found < max; i++) {
        if (versions[i].type == "snapshot") {
            let option = document.createElement("option");
            option.innerText = versions[i].id;
            option.value = versions[i].id;
            _version.appendChild(option);
            found++;
        }
    }
}
function getVersions() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json");
    xhr.addEventListener("readystatechange", foundVersions);
    xhr.send();
}
function foundVersions(_e) {
    document.getElementById("snapshots").addEventListener("change", displayVersions);
    let xhr = _e.target;
    if (xhr.readyState == XMLHttpRequest.DONE) {
        versions = JSON.parse(xhr.response).versions;
        displayVersions();
    }
}
