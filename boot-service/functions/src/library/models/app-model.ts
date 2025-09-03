export interface StorageSetting {
    datasetUrl: string
    datasetCatalogue: string
}

export interface ChatGptSetting {
    modelKey: string
    model: string
    maxTokens?: number
    temperature?: number
    instructions: string
    Project: string
    vectorStoreIds: {
        vectorStoreId: string
        name: string
        type: string
    }[]
    models: ['gpt-4.1-mini', 'gpt-4o-mini', 'o4-mini']
}
export interface AppSetting {
    appId: string;
    organisation: {
        organisationId: string
        name: string
        email: string;
        phoneNumber?: string;
        photoURL?: string;
    }
    displayName: string;
    secret?: string;
    chatGptSetting: ChatGptSetting,
    storageSetting: StorageSetting
}

export interface AppSettingWidget {
    appId: string;
    displayName: string;
    secret?: string;
    chatGptSetting: ChatGptSetting
}

export interface AppFile {
    appId: string;
    fileId: string;
    sha256sum: string;
    filename: string;
    lastIndexed: Date;
    lastUploaded: Date;
    datasetUrl: string;
    datasetCatalogue: string;
    vectorStoreId: string;
    source: string;
    sourceType: "fixed" | "uploaded" | "scanned"
}