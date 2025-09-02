import {firestore} from "firebase-admin";

export class AppStorage {

    private appSettings

    constructor(db: firestore.Firestore) {
        this.appSettings = db.collection("blueboot-apps")
    }


}