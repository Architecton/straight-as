"use strict";

$(document).ready(() => {
    vanillaCalendar.init({
        disablePastDays: true
    });
});

var currentSelectedTodoNote = null;

function createNewTodoNote() {
    var textarea = $("#new-todo-content");
    var newContent = textarea.val();
    textarea.val("");

    $.post("/addtodo", {
        "JWT_token": localStorage.getItem("JWT_token"),
        "description": newContent
    }, (data, status) => {
        //$("html").html(data);
        location.reload();
    }).fail((jqXHR, textStatus, errorThrown) => {
        $("html").html(jqXHR.responseText);
    });
}

function deleteTodo(todoID) {
    $.post("/deletetodo", {
        "JWT_token": localStorage.getItem("JWT_token"),
        "todoID": todoID
    }, (data, status) => {
        //$("html").html(data);
        location.reload();
    }).fail((jqXHR, textStatus, errorThrown) => {
        $("html").html(jqXHR.responseText);
    });
}

function editTodo() {
    let textarea = $("#edit-todo-content");
    let newContent = textarea.val();
    textarea.val("");

    //console.log(newContent);

    $.post("/edittodo", {
        "JWT_token": localStorage.getItem("JWT_token"),
        "todoID": currentSelectedTodoNote,
        "description": newContent
    }, (data, status) => {
        //$("html").html(data);
        location.reload();
    }).fail((jqXHR, textStatus, errorThrown) => {
        $("html").html(jqXHR.responseText);
    });

    //console.log(currentSelectedTodoNote);
    //console.log(newContent);
}

function selectTodoNote(todoID) {
    currentSelectedTodoNote = todoID;
}

var currentSelectedScheduleEntry = null;

function occupiedScheduleClick(entryID) {
    currentSelectedScheduleEntry = entryID;
    var entryName = document.getElementById(entryID).innerText;
    $("#edit-schedule-title").text("Edit " + entryName);
    $('#edit-schedule-entry-modal').modal('toggle');
}

function emptyScheduleClick(cellID) {
    currentSelectedScheduleEntry = cellID;
    $("#new-schedule-title").text("New schedule entry:")
    $('#new-schedule-entry-modal').modal('toggle');
}

function confirmNewScheduleEntry() {
    var colourField = $("#new-schedule-entry-colour");
    var newColour = colourField.val();
    colourField.val("#90EE90");
    var nameField = $("#new-schedule-entry-name");
    var newName = nameField.val();
    nameField.val("");

    var durationField = $("#new-schedule-entry-duration");
    var newDuration = durationField.val();
    durationField.val("");
    var split = currentSelectedScheduleEntry.split("-");
    var row = split[0] - 7;
    var col = split[1];

    console.log(row);
    console.log(col);
    console.log(newColour);
    console.log(newName);
    console.log(newDuration);
}

function confirmEditScheduleEntry() {
    var colourField = $("#edit-schedule-entry-colour");
    var newColour = colourField.val();
    colourField.val("#90EE90");
    var nameField = $("#edit-schedule-entry-name");
    var newName = nameField.val();
    nameField.val("");
    var durationField = $("#edit-schedule-entry-duration");
    var newDuration = durationField.val();
    durationField.val("");

    console.log(currentSelectedScheduleEntry);
    console.log(newColour);
    console.log(newName);
    console.log(newDuration);
}

function deleteScheduleEntry() {
    console.log(currentSelectedScheduleEntry);
}


var dummyCalendarData = {
    "events": [
        {
            "day": 27,
            "month": "may",
            "year": 2019,
            "name": "Doomsday",
            "description": "The end is nigh!",
            _id: "id"
        }
    ]
}
