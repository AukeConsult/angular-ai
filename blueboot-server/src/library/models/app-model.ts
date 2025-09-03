export interface StorageSetting {
    datasetUrl: string
    datasetCatalogue: string
}

export interface ModelSetting {
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
    modelSetting: ModelSetting,
    storageSetting: StorageSetting
}

export interface AppSettingWidget {
    appId: string;
    displayName: string;
    secret?: string;
    modelSetting: ModelSetting
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
    sourceType: "auto" | "uploaded" | "scan"
}