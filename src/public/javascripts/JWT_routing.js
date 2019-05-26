function loadBusses() {
    $.redirect("/bus", {"JWT_token": localStorage.getItem("JWT_token")}, "GET");
}

function loadIndex() {
    $.redirect("/", {"JWT_token": localStorage.getItem("JWT_token")}, "GET");
}
