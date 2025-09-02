import cors, { CorsOptions } from "cors";
import { AppStorage } from ".";
import { app as firebaseAdmin } from "firebase-admin";
import App = firebaseAdmin.App;
import express, { Application } from "express";

export class Server {

    private modelStorage

    constructor(expressApp: Application, firebase: App) {

        this.config(expressApp);
        this.modelStorage = new AppStorage(firebase.firestore());
        expressApp.get("/search/descriptors", async (req, res) => {
            const uid = req.header("x-userid");
            this.modelStorage.getPublichedDiscriptors(uid)
                .then(r => res.json(r))
                .catch(err => {
                    console.error(err)
                    res.status(204).json({error: "ERR-DESCRIPTOR", err: err.message})
                });
        });

    }


    private config(app: Application): void {
        const corsOptions: CorsOptions = {
            origin: "*"
        };

        app.use(cors(corsOptions));
        app.use(express.json({ limit: "20mb" }));
        app.use(express.urlencoded({ limit: "40mb", extended: true, parameterLimit: 50000 }));
        app.get("/", (req, res) => {
            res.json({ message: "hello" });
        });

        app.all("/*", (req, res, next) => {
            next();
        });
    }
}
