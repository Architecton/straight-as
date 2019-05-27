function sendRequest() {
    let oldPassowrd = document.getElementById("old-password").value;
    let newPassword1 = document.getElementById("new-password").value;
    let newPassword2 = document.getElementById("new-password-repeat").value;

    $.post("/change_password", {
        "JWT_token": localStorage.getItem("JWT_token"),
        "old_password": oldPassowrd,
        "new_password1": newPassword1,
        "new_password2": newPassword2,
    }, (data, status) => {
        //$("html").html(data);
        $("html").html(data);
    }).fail((jqXHR, textStatus, errorThrown) => {
        $("html").html(jqXHR.responseText);
    });
}
