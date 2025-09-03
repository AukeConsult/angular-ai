import * as admin from "firebase-admin";
import express from "express";
import {ServiceAccount} from "firebase-admin";
import {fireBaseAdminKey} from "./blueboot.secrets";
import {Server} from "./server";

const firebaseLocal =
    admin.initializeApp({credential: admin.credential.cert(fireBaseAdminKey as ServiceAccount)});

firebaseLocal.firestore().settings({ignoreUndefinedProperties:true})

const expressMain = express()
new Server(expressMain,firebaseLocal)

const PORT = process.env.PORT || 5001;
expressMain.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
