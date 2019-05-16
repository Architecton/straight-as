function login() {
    var userCredentials = {
        "email": document.getElementById("login-email").value,
        "password": document.getElementById("login-password").value
    };

    $.post("/login", userCredentials, function (data, status) {
        //console.log(status);
        //console.log(data);
        if (status === "success") {
            localStorage.setItem("JWT_token", data.JWT_token);
            $.get(data.redirect, {"JWT_token": data.JWT_token}, function (data, status) {
                if(status==="success"){
                    $("html").html(data);
                }
            });
        }
    }, "json");
}
