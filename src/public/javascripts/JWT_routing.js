function loadBusses() {
    $.redirect("/bus", {"JWT_token": localStorage.getItem("JWT_token")}, "GET");
}

function loadIndex() {
    $.redirect("/", {"JWT_token": localStorage.getItem("JWT_token")}, "GET");
}

function loadFood() {
    $.redirect("/food", {"JWT_token": localStorage.getItem("JWT_token")}, "GET");
}

function loadChangePassword() {
    $.redirect("/change_password", {"JWT_token": localStorage.getItem("JWT_token")}, "GET");
}

function loadEvents() {
    $.redirect("/list_events", {"JWT_token": localStorage.getItem("JWT_token")}, "GET");
}
