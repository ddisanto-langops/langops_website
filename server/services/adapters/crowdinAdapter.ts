import { Client, Credentials } from '@crowdin/crowdin-api-client';


class CrowdinAdapter {

    constructor() {
        const token: string | null = process.env.crowdinToken ?? null
        if (!token) {
            throw new Error("Unable to init Crowdin Adapter class: One or more missing API credentials")
        }

       
    }

    

    private static credentials: Credentials = {
        token: token,

    } 

   

    private static crowdinToken = process.env.crowdinToken
    private static _crowdinApi: TranslationStatus | null = null

    protected static get crowdinApi(): TranslationStatus {
        if (!this._crowdinApi) {
            if (!this.crowdinToken) {
                throw new Error("Crowdin Token is missing! Cannot initialize Crowdin client.");
            }
            this._crowdinApi = new TranslationStatus({ token: this.crowdinToken });
        }
        return this._crowdinApi;
    }

    private async getCrowdinData(crowdinUrl: string) {
        if (crowdinUrl && crowdinUrl.length > 0) {
            const match = crowdinUrl.match(this.crowdinPattern)
            if (match) {
                const crowdinProject = match[1].toLowerCase()
                const crowdinProjectId = crowdinProjectIds[crowdinProject]
                const crowdinFileId = match[2]
                
                if (!crowdinProjectId ||!crowdinFileId) return null;
        
                try {
                    const response = await BaseCard.crowdinApi.getFileProgress(
                        Number(crowdinProjectId),
                        Number(crowdinFileId)
                    );
                    const { translationProgress, approvalProgress } = response.data[0].data
                    
                    return {
                        translationProgress,
                        approvalProgress
                    }

                } catch (error) {
                    const message = error instanceof Error ? error.message : "Unknown error"
                    console.error(`Error fetching Crowdin progress for "${this.title}": ${message}`)
                    return null
                }
            }
        }
        return null
    }
}