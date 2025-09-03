import cors, { CorsOptions } from "cors";
import { AppStorage } from ".";
import { app as firebaseAdmin } from "firebase-admin";
import App = firebaseAdmin.App;
import express, { Application } from "express";
import {AppSetting} from "./library";

export class Server {

    private modelStorage

    constructor(expressApp: Application, firebase: App) {

        this.config(expressApp);
        this.modelStorage = new AppStorage(firebase.firestore());
        expressApp.get("/api/get-widget-settings", async (req, res) => {
            let appId = req.header("x-appid");
            if (!appId) {
                appId = "iarbeid"
            }
            this.modelStorage.getWidgetSettings(appId)
                .then(r => res.json(r))
                .catch(err => {
                    console.error(err)
                    res.status(204).json({error: "ERR-DESCRIPTOR", err: err.message})
                });
        });

        expressApp.get("/api/get-app-settings", async (req, res) => {
            let appId = req.header("x-appid");
            if (!appId) {
                appId = "iarbeid"
            }
            this.modelStorage.getAppSettings(appId)
                .then(r => res.json(r))
                .catch(err => {
                    console.error(err)
                    res.status(204).json({error: "ERR-DESCRIPTOR", err: err.message})
                });
        });

        expressApp.post("/api/update-app-settings", async (req, res) => {
            let appId = req.header("x-appid");
            if (!appId) {
                appId = "iarbeid"
            }
            if (appId) {
                const appSetting = req.body as AppSetting;
                this.modelStorage.storeAppSettings(appId, appSetting)
                    .then(r => res.json(r))
                    .catch(err => {
                        console.error(err)
                        res.status(204).json({error: "ERR-APPSETTING", err: err.message})
                    });
            } else {
                res.status(204).json({error: "ERR-APPID", message: "wrong appid"});
            }
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
            res.json({ message: "hello from blueboot" });
        });

        app.all("/*", (req, res, next) => {
            next();
        });
    }
}
