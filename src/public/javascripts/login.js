"use strict";
function login() {
    let userCredentials = {
        "email": document.getElementById("login-email").value,
        "password": document.getElementById("login-password").value
    };

    $.post("/login", userCredentials, function (data, status) {
        //console.log(status);
        //console.log(data);
        if (status === "success") {
            localStorage.setItem("JWT_token", data.JWT_token);
            console.log(data.redirect);
            $.get(data.redirect, {"JWT_token": data.JWT_token}, function (data1, status1) {
                if(status1==="success"){
                    $("html").html(data1);
                }
            });
        }
    }, "json");
}
