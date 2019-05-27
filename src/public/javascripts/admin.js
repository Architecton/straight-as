function sendMessage() {
    let textarea = $("#new-message-content");
    let text = textarea.val();
    textarea.val("");

    alert("Message \"" + text + "\" sent!");
}
