/* global jQuery */

$(document).ready(function() {
    $("#bus-arrivals-form").submit(function(event) {
        event.preventDefault();
        var data = new FormData(this);
        console.log(data);

        var req = new XMLHttpRequest();

        req.open("POST", "/bus", true);
        req.onload = function(event){
            if (req.status == 200){
                console.log("Upload Successful.");
            }
            else{
                console.log("Error uploading!");
            }
        };
        req.send(data);

    });
});