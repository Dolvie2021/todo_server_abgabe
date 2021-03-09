import * as express from "express";
import * as session from "express-session";
import * as mysql from "mysql";

// Ergänzt/Überläd den Sessionstore um das Attribut "signInName"
declare module "express-session" {
    interface Session {
        signInName: string;
        signInId:number;
    }
}
//Speicherung der Daten für die Local-Session
//var localsesion={
 //   signInName:undefined,
//   signInId:undefined,
//}

// 1-Stellt eine Verbindung zum Datenbankserver her

const connection: mysql.Connection = mysql.createConnection({
    database: "modul-server",
    host: "localhost",
    user: "root",
    multipleStatements: true
});


//2- Öffnet die Verbindung zum Datenbankserver
connection.connect((err) => {
    if (err !== null) {
        console.log("DB-Fehler: " + err);
    }
});




// Erzeugt und startet einen Express-Server
const router: express.Express = express();
router.listen(8080, () => {
    console.log("Server gestartet auf http://localhost:8080");
});



// Bei jedem Request werden vorhandene Nutzdaten von Text in Objekte geparst
router.use(express.json());
router.use(express.urlencoded({extended: false}));

//3- Bei jedem Request wird, falls noch nicht vorhanden, ein Cookie erstellt <-
router.use(session({
    cookie: {
        expires: new Date(Date.now() + (1000 * 60 * 60)),
    },
    secret: Math.random().toString(),
    name: 'connect.sid',
}));

// Der Ordner ./view/res wird auf die URL /res gemapped
router.use("/res", express.static(__dirname + "/view/res"));

// Gibt auf der URL / die Startseite zurück
router.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile(__dirname + "/view/index.html");
});

// Beschreibt alle Routen und ruft die jeweilige Funktion oder Funktionskette auf
router.post("/signIn", signIn);
router.post("/signOut", signOut);
router.post("/task", checkLogin, addTask);
router.delete("/task/:id", checkLogin, delTask);
router.get("/tasks", checkLogin, getTasks);
router.get("/isLoggedIn", checkLogin, isLoggedIn);
router.post("/registrierung",registrierung);
router.delete("/anwender",checkLogin,allesLöschen);
router.put("/updateTask/:id",checkLogin,updateTask);

//4- Prüft, ob ein Nutzer registriert ist und speichert ggf. den Nutzernamen im Sessionstore ab
function signIn(req: express.Request, res: express.Response): void {
    const signInName: string = req.body.signInName;
    const signInPass: string = req.body.signInPass;

    query( "SELECT * FROM `anwender` WHERE `name` = ? and `passwort`= ? ", [signInName,signInPass]).then((result:any) => {

        if(result!= undefined && result.length>0 ){

            //Fals nicht in dem Request gespeichert wird
            req.session.signInName = signInName;
            req.session.signInId = result[0].id;
            req.session.save();
            res.sendStatus(200);

        }else{
            res.status( 400).send("Anmeldung fehlgeschlagen. Bitte erneut versuchen");
        }

    }).catch(() =>{
        res.sendStatus(500);
    });
    res.status(200);

}                                                                                                   //

// Neu Registrierung
function registrierung(req:express.Request,res:express.Response):void{
    const name:string= req.body.rname;
    const passwort: string= req.body.passwort;

    if(name!==undefined && passwort!==undefined) {
        query("INSERT INTO `anwender`(name,passwort) VALUES (?,?);", [name, passwort]).then(() => {
            res.status(201);
        }).catch((err: mysql.MysqlError) => {
            res.sendStatus(500);
            console.log("Fehler in POST /module");
            console.log(err);
        });
    }else{
        res.status(400);
    }
}

//5- Löscht den Sessionstore und weist den Client an, das Cookie zu löschen
function signOut(req: express.Request, res: express.Response): void {
    req.session.signInId = undefined;
    req.session.signInName = undefined;
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.sendStatus(200);
    });
}

// 6-Fügt einen neuen Task der Datenbank hinzu <-
function addTask(req: express.Request, res: express.Response): void {
    const taskName: string = req.body.taskName;
    const signInid: number = req.session.signInId;
    const taskDate: string = req.body.taskDate;

    if (signInid !== undefined && taskDate!==undefined && taskName!==undefined) {
        query("INSERT INTO Task (name, titel, faelligkeit) VALUES (?, ?, ?);",
            [signInid,taskName, taskDate]).then(() => {
                res.status(201);

        }).catch((err: mysql.MysqlError) => {
            res.sendStatus(500);
            console.log("Fehler in POST /module");
            console.log(err);
        });
    } else {
        res.sendStatus(400);
    }

}

//7- Löscht einen Task aus der Datenbank <-
function delTask(req: express.Request, res: express.Response): void {
    const id: string = req.params.id;
    query("DELETE FROM task WHERE id = ?;", [id]).then((results: any) => {
        if (results.affectedRows === 1) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    }).catch((err: mysql.MysqlError) => {
        res.sendStatus(500);
        console.log("Fehler in DELETE /module");
        console.log(err);
    });

}
//lösch ganz ein Anwender mit seinen Tasks
function allesLöschen(req:express.Request,res:express.Response):void{
    const id: number = req.session.signInId;
    query("DELETE FROM task WHERE name=?; DELETE FROM anwender WHERE id=?;",[id,id]).then((result:any)=>{
        if(result.affectedRows===1) {
            res.sendStatus(200);
            req.session.signInId = undefined;
            req.session.signInName=undefined;
        }else{
            res.sendStatus(404);
        }
    }).catch((err:mysql.MysqlError)=>{
        res.sendStatus(500);
        console.log(err);
    })
}


// 8-Gibt alle Tasks eines Anwenders zurück
function getTasks(req: express.Request, res: express.Response): void {
    query("SELECT id, titel, faelligkeit FROM task WHERE name = ?;", [req.session.signInId]).then((result: any) => {
        res.json(result);
    }).catch(() => {
        // DBS-Fehler
        res.sendStatus(500);
    });
}

//updtate ein Task
function updateTask(req:express.Request,res:express.Response){
    const id: string =req.params.id;
    const titel :string = req.body.titel;
    const faelligkeit : string= req.body.faelligkeit;
    if(titel!==undefined && faelligkeit!==undefined) {
        query("UPDATE task  SET titel=?, faelligkeit=? WHERE id=?;", [titel, faelligkeit,id]).then(() => {
            res.status(200);
        }).catch((err: mysql.MysqlError) => {
            res.sendStatus(500);
            console.log("Fehler in PUT/module");
            console.log(err);
        });
    } else {
        res.sendStatus(400);
    }

}

//9- Eine sog. Middleware-Route prüft, ob der Client angemeldet ist und ruft ggf. die nächste Funktion auf
function checkLogin(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (req.session.signInName !== undefined) {

        //10- Ruft die nächste Funktion der Funktioskette
        next();
    } else {
        //11- Client nicht angemeldet
        res.sendStatus(401);
    }
}


// Kleine Hilfsfunktion, die immer 200 OK zurückgibt
function isLoggedIn(req: express.Request, res: express.Response): void {
    res.sendStatus(200);
}

// Ein eigener Wrapper, um die MySQL-Query als Promise (then/catch Syntax) zu nutzen
function query(sql: string, param: any[] = []): Promise<any> {
    return new Promise<any>((resolve: any, reject: any) => {
        connection.query(sql, param, (err: mysql.MysqlError | null, results: any) => {
            if (err === null) {
                resolve(results);
            } else {
                reject(err);
            }
        });
    });
}