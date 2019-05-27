

function newEvent(){
    var title = $("#new-event-name").val();
    var date = $("#new-event-date").val();
    var organizer = $("#new-event-organizer").val();
    var description = $("#new-event-description").val();

    $.post("/events", {
        "JWT_token": localStorage.getItem("JWT_token"),
        "description": description,
        "title": title,
        "date": date,
        "organizer": organizer
    }, (data, status) => {
        location.reload();
    }).fail((jqXHR, textStatus, errorThrown) => {
        $("html").html(jqXHR.responseText);
    });
}
