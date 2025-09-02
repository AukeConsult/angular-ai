export interface AppSetting {
    appId: string;
    organisation: {
        id: string
        name: string
        email: string;
        phoneNumber?: string;
        photoURL?: string;
    }
    displayName: string;
    secret?: string;
    modelSetting: {
        key: string;
        model: string;
        instructions: string;
        Project: string;
        vectorStoreIds: {
            id: string;
            name: string;
            type: string;
        }[]
    }
    storageSetting: {
        datasetUrl: string;
        datasetCatalogue: string;
    }
}

export interface AppFile {
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