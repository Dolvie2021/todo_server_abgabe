"use strict";
//exports.__esModule = true;
//var axios_1 = require("axios"); // Diese Zeile vor der Ausführung auskommentieren!
var signInComp;
var signOutComp;
var tasksComp;
var tasksTable;
var alertComp;
var registrierungComp;
var editTaskComp;
var editform;
var profilLöschenComp;
var id1;
var regisForm;
document.addEventListener("DOMContentLoaded", function () {
    signInComp = document.getElementById("signIn");
    signOutComp = document.getElementById("signOut");
    tasksComp = document.getElementById("tasks");
    tasksTable = document.getElementById("tasksTable");
    alertComp = document.getElementById("alert");
    registrierungComp = document.getElementById("registrierung");
    editTaskComp = document.getElementById("edit");
    profilLöschenComp = document.getElementById("profilLöschen");
    editform = document.getElementById("formEDITTask");
    regisForm = document.getElementById("registrierungForm");


    document.getElementById("signInForm").addEventListener("submit", signIn);
    regisForm.addEventListener("submit", registrierung);
    document.getElementById("signOutForm").addEventListener("submit", signOut);
    document.getElementById("formAddTask").addEventListener("submit", addTask);
    document.getElementById("profilLöschenForm").addEventListener("submit", profilLöschen);
    tasksTable.addEventListener("click", editTask);
    tasksTable.addEventListener("click", deleteTask);
    document.getElementById("buttonReg").addEventListener("click", regForm);
    editform.addEventListener("submit", modifier);
    checkLogin();
});

function signIn(event) {
    event.preventDefault();
    var target = event.currentTarget;
    var formData = new FormData(target);
    axios["default"].post("/signIn", {
        signInName: formData.get("signInName"),
        signInPass: formData.get("signInPass")
    }).then(function () {
        // Leer das Formular und blendet andere Seitenbereiche ein/aus
        target.reset();
        hide(signInComp);
        hide(registrierungComp);
        show(signOutComp);
        show(tasksComp);
        show(profilLöschenComp);
        hide(editTaskComp);
        renderTasksList();
    })["catch"](function (err) {
        switch (err.response.status) {
            case 404: //Not found
                printAlert("Nicht angemeldet");
                break;
            default: //Sonstige Fehler
                printAlert("Fehler: " + err.response.statusText);
                break;
        }
    });
}
function regForm(event) {
    event.preventDefault();
    hide(signInComp);
    show(registrierungComp);
    hide(editTaskComp);
    hide(signOutComp);
    hide(tasksComp);
}
function registrierung(event) {


    var formData = new FormData(regisForm);

    axios["default"].post("/registrierung", {
        rname: formData.get("registrierungName"),
        passwort: formData.get("registrierungPass")

    }).then(function () {
        // Leer das Formular und blendet andere Seitenbereiche ein/aus
       // alert("alo");


       show(signInComp);
       // hide(registrierungComp);
        //hide(signOutComp);
       // hide(tasksComp);
        //hide(profilLöschenComp);
        //hide(editTaskComp);
    })["catch"](function (err) {
        printAlert(err.response.status);
    });
}
function signOut(event) {
    event.preventDefault();
    axios["default"].post("/signOut")["finally"](function () {
        show(signInComp);
        hide(signOutComp);
        hide(tasksComp);
        hide(profilLöschenComp);
        tasksTable.innerText = "";
    });
}
function profilLöschen(event) {
    event.preventDefault();
    axios["default"]["delete"]("/anwender")["finally"](function () {
        show(signInComp);
        hide(registrierungComp);
        hide(signOutComp);
        hide(tasksComp);
        hide(editTaskComp);
        hide(profilLöschenComp);
    });
}
function editTask(event) {
    event.preventDefault();
    // Sucht vom echten Ziel des Klicks den nächstgelegenen Button (da das Ziel meist das Icon im Button ist)
    var target = event.target;
    // Wenn überhaupt der Button geklickt wurde und nicht irgendwas anderes in der Tabelle
    if (target !== null && target.classList.contains("edit")) {
        id1 = target.dataset.taskid1;
        hide(signInComp);
        hide(registrierungComp);
        hide(signOutComp);
        hide(tasksComp);
        show(editTaskComp);
        hide(profilLöschenComp);
        return id1;
    }
}
function modifier(event) {
    var formData = new FormData(editform);
    axios["default"].put("/updateTask/" + id1, {
        titel: formData.get("neutaskName"),
        faelligkeit: formData.get("neutaskDate")
    }).then(function () {
        renderTasksList();
        hide(signInComp);
        hide(registrierungComp);
        show(signOutComp);
        show(tasksComp);
        hide(editTaskComp);
        show(profilLöschenComp);
    })["catch"](function (err) {
        switch (err.response.status) {
            case 404: //Not found
                printAlert("Task nicht gefunden");
                break;
            case 401: //Unauthorized
                printAlert("Nicht angemeldet");
                break;
            case 403: //Forbidden
                printAlert("Nicht berechtigt");
                break;
            default: //Sonstige Fehler
                printAlert("Fehler: " + err.response.statusText);
                break;
        }
    });
}
function addTask(event) {

    var target = event.currentTarget;
    var formData = new FormData(target);
    axios["default"].post("/task", {
        taskName: formData.get("taskName"),
        taskDate: formData.get("taskDate")
    }).then(function () {
        target.reset();
        renderTasksList();
    })["catch"](function (err) {
        switch (err.response.status) {
            case 401: //Unauthorized
                printAlert("Nicht angemeldet");
                break;
            default: //Sonstige Fehler
                printAlert("Fehler: " + err.response.statusText);
                break;
        }
    });
}
function deleteTask(event) {
    // Sucht vom echten Ziel des Klicks den nächstgelegenen Button (da das Ziel meist das Icon im Button ist)
    var target = event.target.closest("button");
    // Wenn überhaupt der Button geklickt wurde und nicht irgendwas anderes in der Tabelle
    if (target !== null && target.classList.contains("delete")) {
        var id = target.dataset.taskid;
        axios["default"]["delete"]("/task/" + id).then(function () {
            renderTasksList();
        })["catch"](function (err) {
            switch (err.response.status) {
                case 404: //Not found
                    printAlert("Task nicht gefunden");
                    break;
                case 401: //Unauthorized
                    printAlert("Nicht angemeldet");
                    break;
                case 403: //Forbidden
                    printAlert("Nicht berechtigt");
                    break;
                default: //Sonstige Fehler
                    printAlert("Fehler: " + err.response.statusText);
                    break;
            }
        });
    }
}
function renderTasksList() {
    axios["default"].get("/tasks").then(function (res) {
        tasksTable.innerText = "";
        for (var _i = 0, _a = res.data; _i < _a.length; _i++) {
            var task = _a[_i];
            var row = document.createElement("tr");
            row.innerHTML = "<td>" + task.titel + "</td>\n                            <td>" + task.faelligkeit + "</td>\n                            <td><button class=\"btn btn-primary delete\" data-taskid=\"" + task.id + "\"><i class=\"fas fa-check\"></i></button></td>\n                            <td><button class=\"btn btn-primary edit\" data-taskid1=\"" + task.id + "\" onclick=\"editTask()\"><i class=\"fas fa-check\"></i></button></td>";
            tasksTable.appendChild(row);
        }
    });
}
// Kleine Hilfsfunktion, die beim Seitenaufruf schon prüft, ob ein aktiver Login existiert
function checkLogin() {
    axios["default"].get("/isLoggedIn").then(function () {
        hide(signInComp);
        hide(registrierungComp);
        hide(editTaskComp);
        show(signOutComp);
        show(tasksComp);
        renderTasksList();
    })["catch"](function () {
        show(signInComp);
        hide(registrierungComp);
        hide(signOutComp);
        hide(tasksComp);
        hide(editTaskComp);
        hide(profilLöschenComp);
    });
}
// Gibt Fehlermeldungen für 10 Sekunden auf der Seite aus
function printAlert(msg) {
    alertComp.innerHTML = "<p class=\"text-danger\">" + msg + "</p>";
    setTimeout(function () {
        hide(alertComp);
    }, 10000);
    show(alertComp);
}
function show(elem) {
    elem.style.display = "block";
}
function hide(elem) {
    elem.style.display = "none";
}
