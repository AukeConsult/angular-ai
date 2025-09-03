import cors, { CorsOptions } from "cors";
import { AppStorage } from "./services/app-storage";
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
                .then((r: any) => res.json(r))
                .catch((err: { message: any; }) => {
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
                .then((r: any) => res.json(r))
                .catch((err: { message: any; }) => {
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
                    .then((r: any) => res.json(r))
                    .catch((err: { message: any; }) => {
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
        app.get("/api", (req, res) => {
            res.json([
                { url: "/get-app-settings", verb: "GET", header: "'x-appid': '<appid>'", description: "Get the App Settings, return a new if not exising" },
                { url: "/update-app-settings", verb: "POST", header: "'x-appid': '<appid>'", body: "'add json interface from /get-app-settings'", description: "store and update settings",},
                { url: "//get-widget-settings", verb: "GET", header: "'x-appid': '<appid>'", description: "Get the widget Settings" },
            ]);
        });
        app.all("/*", (req, res, next) => {
            next();
        });
    }
}
