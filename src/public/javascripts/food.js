
function initMap() {
    getLocation()
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
    }
}

function handleSuccess(result) {

    var position = {lat: result.coords.latitude, lng: result.coords.longitude};
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 14, center: position});
    var marker = new google.maps.Marker({position: position, title:"You are here", map: map, icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}});
    // GET RESTAURNT DATA FROM DATABASE
    // dummyData = AJAX.magic

        $.post("/restaurants", {
            "lat": position.lat,
            "lon": position.lng,
            "sort": "distance"
        }, (data, status) => {
            for (var i = 0; i < data.closest_restaurants.length; i++) {
                var restaurant = data.closest_restaurants[i];
                var marker = new google.maps.Marker({
                    position: {lat: restaurant.latitude, lng: restaurant.longitude},
                    title: restaurant.name,
                    map: map
                });

                var newTableRow = "<tr>" +
                    "<td>" + restaurant.name + "</td>" +
                    "<td>" + restaurant.address + "</td>" +
                    "<td>" + restaurant.surcharge + "</td>" +
                    "</tr>"

                $('#restaurant-table > tbody:last-child').append(newTableRow);
            }
        }).fail((jqXHR, textStatus, errorThrown) => {
            $("html").html(jqXHR.responseText);
        });

}

function handleError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            break;
        default:
            console.log("An unknown error occurred.");
            break;
    }
    var position = {lat: 46.056463, lng: 14.505643}
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 14, center: position});
    var marker = new google.maps.Marker({position: position, title:"You are here", map: map, icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}});

    // GET RESTAURNT DATA FROM DATABASE
    // dummyData = AJAX.magic

    $.post("/restaurants", {
        "lat": position.lat,
        "lon": position.lng,
        "sort": "alphabetical"
    }, (data, status) => {

        for (var i = 0; i < data.closest_restaurants.length; i++){
            var restaurant = data.closest_restaurants[i];
            var marker = new google.maps.Marker({position: {lat: restaurant.latitude, lng: restaurant.longitude}, title: restaurant.name, map: map});

            var newTableRow = "<tr>" +
                "<td>" + restaurant.name + "</td>" +
                "<td>" + restaurant.address + "</td>" +
                "<td>" + restaurant.surcharge + "</td>" +
                "</tr>"

            $('#restaurant-table > tbody:last-child').append(newTableRow);
        }

    }).fail((jqXHR, textStatus, errorThrown) => {
        $("html").html(jqXHR.responseText);
    });
}