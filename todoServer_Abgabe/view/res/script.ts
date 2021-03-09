import axios , {AxiosResponse} from "axios"; // Diese Zeile vor der Ausführung auskommentieren!

let signInComp: HTMLElement;
let signOutComp: HTMLElement;
let tasksComp: HTMLElement;
let tasksTable: HTMLElement;
let alertComp: HTMLElement;
let registrierungComp: HTMLElement;
let editTaskComp:HTMLElement;
let editform: HTMLFormElement;
let profilLöschenComp: HTMLElement;
let id1;
let regisForm:HTMLFormElement;

document.addEventListener("DOMContentLoaded", () => {
    signInComp = document.getElementById("signIn");
    signOutComp = document.getElementById("signOut");
    tasksComp = document.getElementById("tasks");
    tasksTable = document.getElementById("tasksTable");
    alertComp = document.getElementById("alert");
    registrierungComp = document.getElementById("registrierung");
    editTaskComp = document.getElementById("edit");
    profilLöschenComp= document.getElementById("profilLöschen");
    editform = document.getElementById("formEDITTask") as HTMLFormElement;
    regisForm = document.getElementById("registrierungForm") as HTMLFormElement;

    document.getElementById("signInForm").addEventListener("submit", signIn);
    regisForm.addEventListener("submit", registrierung);
    document.getElementById("signOutForm").addEventListener("submit", signOut);
    document.getElementById("formAddTask").addEventListener("submit", addTask);
    document.getElementById("profilLöschenForm").addEventListener("submit",profilLöschen);
    tasksTable.addEventListener("click",editTask);
    tasksTable.addEventListener("click", deleteTask);
    document.getElementById("buttonReg").addEventListener("click",regForm);
    editform.addEventListener("submit",modifier);
    checkLogin();
});

function signIn(event: Event): void {
    event.preventDefault();
    const target: HTMLFormElement = event.currentTarget as HTMLFormElement;
    const formData: FormData = new FormData(target);

    axios.post("/signIn", {
        signInName: formData.get("signInName"),
        signInPass: formData.get("signInPass")
    }).then(() => {
        // Leer das Formular und blendet andere Seitenbereiche ein/aus
        target.reset();
        hide(signInComp);
        hide(registrierungComp);
        show(signOutComp);
        show(tasksComp);
        show(profilLöschenComp);
        hide(editTaskComp);
        renderTasksList();
    }).catch((err) => {
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
function regForm(event:Event):void{
    event.preventDefault();
    hide(signInComp);
    show(registrierungComp);
    hide(editTaskComp);
    hide(signOutComp);
    hide(tasksComp);

}

function registrierung(event: Event): void {
    //event.preventDefault();

    //const target: HTMLFormElement = event.currentTarget as HTMLFormElement;
    const formData: FormData = new FormData(regisForm);

    axios.post("/registrierung", {
        rname: formData.get("registrierungName"),
        passwort: formData.get("registrierungPass")
    }).then(() => {

        //alert("alo")
        //target.reset();
        show(signInComp);
       // hide(registrierungComp);
       // hide(signOutComp);
       // hide(tasksComp);
       // hide(profilLöschenComp);
       // hide(editTaskComp);

    }).catch((err)=>{
        printAlert(err.response.status);
    });
}




function signOut(event: Event): void {
    event.preventDefault();
    axios.post("/signOut").finally(() => {
        show(signInComp);
        hide(signOutComp);
        hide(tasksComp);
        hide(profilLöschenComp);
        tasksTable.innerText = "";
    });
}

function profilLöschen(event: Event): void {
      event.preventDefault();
        axios.delete("/anwender").finally(() => {
            show(signInComp);
            hide(registrierungComp);
            hide(signOutComp);
            hide(tasksComp);
            hide(editTaskComp);
            hide(profilLöschenComp);
        });

}


function editTask(event: Event) {
    event.preventDefault();
    // Sucht vom echten Ziel des Klicks den nächstgelegenen Button (da das Ziel meist das Icon im Button ist)
    const target:HTMLElement = event.target as HTMLElement;


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
 function modifier(event:Event){


         const formData = new FormData(editform);
         axios.put("/updateTask/" + id1,{
             titel : formData.get("neutaskName"),
             faelligkeit : formData.get("neutaskDate")
         }).then(() => {
             renderTasksList();
             hide(signInComp);
             hide(registrierungComp);
             show(signOutComp);
             show(tasksComp);
             hide(editTaskComp);
             show(profilLöschenComp);

         }).catch((err) => {
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


function addTask(event: Event): void {
    event.preventDefault();
    const target: HTMLFormElement = event.currentTarget as HTMLFormElement;
    const formData: FormData = new FormData(target);

    axios.post("/task", {
        taskName: formData.get("taskName"),
        taskDate: formData.get("taskDate")
    }).then(() => {
        target.reset();
        renderTasksList();
    }).catch((err) => {
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



function deleteTask(event: Event): void {
    // Sucht vom echten Ziel des Klicks den nächstgelegenen Button (da das Ziel meist das Icon im Button ist)
    const target: HTMLElement = (event.target as HTMLElement).closest("button");

    // Wenn überhaupt der Button geklickt wurde und nicht irgendwas anderes in der Tabelle
    if (target !== null && target.classList.contains("delete")) {
        const id: string = target.dataset.taskid;

        axios.delete("/task/" + id).then(() => {
            renderTasksList();
        }).catch((err) => {
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



function renderTasksList(): void {
    axios.get("/tasks").then((res: AxiosResponse) => {
        tasksTable.innerText = "";
        for (const task of res.data) {
            const row: HTMLElement = document.createElement("tr");
            row.innerHTML = `<td>${task.titel}</td>
                            <td>${task.faelligkeit}</td>
                            <td><button class="btn btn-primary delete" data-taskid="${task.id}"><i class="fas fa-check"></i></button></td>
                            <td><button class="btn btn-primary edit" data-taskid1="${task.id}" onclick="editTask()"><i class="fas fa-check"></i></button></td>`;
            tasksTable.appendChild(row);
        }
    });
}

// Kleine Hilfsfunktion, die beim Seitenaufruf schon prüft, ob ein aktiver Login existiert
function checkLogin(): void {
    axios.get("/isLoggedIn").then(() => {
        hide(signInComp);
        hide(registrierungComp);
        hide(editTaskComp);
        show(signOutComp);
        show(tasksComp);
        renderTasksList();
    }).catch(() => {
        show(signInComp);
        hide(registrierungComp);
        hide(signOutComp);
        hide(tasksComp);
        hide(editTaskComp);
        hide(profilLöschenComp);
    });
}

// Gibt Fehlermeldungen für 10 Sekunden auf der Seite aus
function printAlert(msg: string): void {
    alertComp.innerHTML = `<p class="text-danger">${msg}</p>`
    setTimeout(() => {
        hide(alertComp);
    }, 10000);
    show(alertComp);
}

function show(elem: HTMLElement): void {
    elem.style.display = "block";
}

function hide(elem: HTMLElement): void {
    elem.style.display = "none";
}