interface Version {
  id: string,
  type: string
}
window.addEventListener("load", getVersions);
let versions: Version[] = [];

function displayVersions() {
  let version: HTMLSelectElement = <HTMLSelectElement>document.getElementById("version");
  let snapshot: boolean = (<HTMLInputElement>document.getElementById("snapshots")).checked;
  version.innerHTML = "";

  if (snapshot) {
    displaySnapshotVersions(version);
  } else {
    displayReleaseVersions(version);
  }

}

function displayReleaseVersions(_version: HTMLSelectElement) {
  let oldest: number = 9;
  let prevMajor: string = ""
  let optGroup: HTMLOptGroupElement;
  for (let i: number = 0; i < versions.length; i++) {
    if (versions[i].type == "release") {
      let v: string[] = versions[i].id.split(".");
      if (+v[1] < oldest) break;
      if (v[1] != prevMajor) {
        optGroup = document.createElement("optgroup");
        optGroup.label = v[0] + "." + v[1];
        prevMajor = v[1];
        _version.appendChild(optGroup);
      }
      let option: HTMLOptionElement = document.createElement("option");
      option.innerText = versions[i].id;
      option.value = versions[i].id;
      optGroup.appendChild(option);
    }
  }
}

function displaySnapshotVersions(_version: HTMLSelectElement) {
  let max: number = 40;
  let found: number = 0;
  for (let i: number = 0; i < versions.length && found < max; i++) {
    if (versions[i].type == "snapshot") {
      let option: HTMLOptionElement = document.createElement("option");
      option.innerText = versions[i].id;
      option.value = versions[i].id;
      _version.appendChild(option);
      found++;
    }
  }
}

function getVersions() {
  let xhr: XMLHttpRequest = new XMLHttpRequest();
  xhr.open("GET", "https://launchermeta.mojang.com/mc/game/version_manifest.json");
  xhr.addEventListener("readystatechange", foundVersions);
  xhr.send();
}

function foundVersions(_e: ProgressEvent) {
  document.getElementById("snapshots").addEventListener("change", displayVersions);

  let xhr: XMLHttpRequest = <XMLHttpRequest>_e.target;
  if (xhr.readyState == XMLHttpRequest.DONE) {
    versions = JSON.parse(xhr.response).versions;
    displayVersions();
  }
}