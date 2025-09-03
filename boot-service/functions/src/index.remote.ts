import express from "express";

export * from "./services/app-storage"
export * from "./server";
import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {Server} from "./server";

const firebaseLocal = admin.initializeApp();
firebaseLocal.firestore().settings({ignoreUndefinedProperties:true})
const expressMain = express()
new Server(expressMain,firebaseLocal)
exports.bluebootApi = onRequest(expressMain)
