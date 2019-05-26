function getArrivals(){
    var station = $("#bus-stop-id").val();

    $.post("/bus", {
        "JWT_token": localStorage.getItem("JWT_token"),
        "station": station
    }, (data, status) => {
        $("html").html(data);
    }).fail((jqXHR, textStatus, errorThrown) => {
        $("html").html(jqXHR.responseText);
    });

}