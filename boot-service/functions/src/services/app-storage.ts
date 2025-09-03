import {firestore} from "firebase-admin";
import {openAiApiKey} from "../blueboot.secrets"
import {AppSetting, AppSettingWidget} from "../library";

export class AppStorage {

    async getAppSettings(appId: any): Promise<AppSetting> {

        return {
            appId: appId,
            displayName: "iarbeid search",
            chatGptSetting: {
                modelKey: openAiApiKey,
                model: "gpt-4.1-mini",
                instructions: "Du er en RAG-assistent. Du MÅ alltid bruke file_search før du svarer. " +
                    "Hvis ingen relevante treff: svar 'Ingen treff i dokumentene.' og ikke gjett. Svar på norsk.",
                Project: "",
                vectorStoreIds: [{
                    vectorStoreId: "vs_68af29fb0da481919883202b65cdfe78",
                    name: "iarbeid storage",
                    type: "chatgpt",
                }]
            }

        } as AppSetting
    }
    async storeAppSettings(appId: any, appSetting: AppSetting): Promise<AppSetting> {
        return appSetting
    }

    async getWidgetSettings(appId: any): Promise<AppSettingWidget> {

            return {
                appId: appId,
                displayName: "iarbeid search",
                chatGptSetting: {
                    modelKey: openAiApiKey,
                    model: "gpt-4.1-mini",
                    instructions: "Du er en RAG-assistent. Du MÅ alltid bruke file_search før du svarer. " +
                        "Hvis ingen relevante treff: svar 'Ingen treff i dokumentene.' og ikke gjett. Svar på norsk.",
                    Project: "",
                    vectorStoreIds: [{
                        vectorStoreId: "vs_68af29fb0da481919883202b65cdfe78",
                        name: "iarbeid storage",
                        type: "chatgpt",
                    }]
                }

            } as AppSettingWidget

    }

    private appSettings
    constructor(db: firestore.Firestore) {
        this.appSettings = db.collection("blueboot-apps")
    }


}