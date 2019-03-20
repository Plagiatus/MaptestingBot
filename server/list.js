document.addEventListener("DOMContentLoaded", load);
let users = [];
let results;
let searchInput;
function load() {
    results = document.getElementById("results");
    searchInput = document.getElementById("name-input");
    searchInput.addEventListener("input", filterByName);
    let rawData = results.innerHTML;
    users = JSON.parse(rawData);
    users.sort(sortByXP);
    display(users);
}
function filterByName() {
    let filteredUsers = Object.assign([], users);
    for (let i = 0; i < filteredUsers.length; i++) {
        if (filteredUsers[i].name.toLowerCase().search(searchInput.value.toLowerCase()) < 0) {
            filteredUsers.splice(i, 1);
            i--;
        }
    }
    display(filteredUsers);
}
function display(_users) {
    results.innerHTML = "";
    for (let u of _users) {
        results.innerHTML += generateOne(u);
    }
    if (_users.length == 0) {
        results.innerHTML += `<div class="result"><div><p>nothing found</p><p>sorry.</p></div></div>`;
    }
}
function generateOne(u) {
    return `<div class="result">
		<div>
			<p>${u.name}</p><p>Username</p>
		</div>
		<div>
			<p>${u.lvl}</p><p>Level</p>
		</div>
		<div>
			<p>${u.xp}</p><p>XP</p>
		</div>
		<div>
			<p>${u.h}</p><p>Hosted Sessions</p>
		</div> 
		<div>
			<p>${u.j}</p><p>Joined Sessions</p>
		</div>
	</div>`;
}
function sortByName(a, b) {
    if (a.name > b.name)
        return 1;
    if (a.name < b.name)
        return -1;
    return 0;
}
function sortByXP(a, b) {
    if (a.xp > b.xp)
        return -1;
    if (a.xp < b.xp)
        return 1;
    return 0;
}
function sortByHosted(a, b) {
    if (a.h > b.h)
        return -1;
    if (a.h < b.h)
        return 1;
    return 0;
}
function sortByJoined(a, b) {
    if (a.j > b.j)
        return -1;
    if (a.j < b.j)
        return 1;
    return 0;
}
