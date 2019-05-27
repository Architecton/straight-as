function signup() {
    let email = document.getElementById("signup-email").value;
    let geslo1 = document.getElementById("signup-password").value;
    let geslo2 = document.getElementById("signup-password-repeat").value;

    console.log(email + " " + geslo1 + " " + geslo2);

    //1. nivo obrambe
    if (geslo1 !== geslo2) {
        alert("Gesli se ne ujemata!");
    } else {
        //pošlji zahtevo
        $.post("/signup", {
            "email": email,
            "password1": geslo1,
            "password2": geslo2
        }, (data, status) => {
            //če je signup uspešen, pojdi na login
            $("html").html(data);
        }).fail((jqXHR, textStatus, errorThrown) => {
            $("html").html(jqXHR.responseText);
        })
    }
}
