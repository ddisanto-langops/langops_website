import { TranslationStatus } from '@crowdin/crowdin-api-client';


import { 
    type RawTrelloCard, 
    type RawYouTubeData, 
    type RawCrowdinData, 
    type LangOpsProductSchema,
    type TrelloDataSchema,
    type YouTubeDataSchema,
    type CrowdinDataSchema
} from "../shared/types.js"






const groupLookup = new Map();
for (const [groupName, codes] of Object.entries(mediaGroups)) {
    codes.forEach(code => {
        if (!groupLookup.has(code)) {
            groupLookup.set(code, []);
        }
        groupLookup.get(code).push(groupName);
    });
}






class YouTubeData {

    protected getDuration() {
        //TODO: implement via YouTube API
        return null
    }
}


class CrowdinData extends TrelloData {

    constructor(editorUrl: string) {
        editorUrl.match(this.crowdinPattern)
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






export class LangOpsProduct {
    

    private async getProductStatus() {
        const published = this.datePublished
        if (published) {
            const crowdinUrl = this.urls.crowdinUrl
            if (crowdinUrl) {
                const crowdinData = await this.getCrowdinData(crowdinUrl) ?? {translationProgress: null, approvalProgress: null}
                return {
                    status: 'published',
                    translationProgress: crowdinData.translationProgress,
                    approvalProgress: crowdinData.translationProgress
                }
            } else {
                return {
                    status: published,
                    translationProgress: null,
                    approvalProgress: null
                }
            }
            
        }

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const hasRecentActivity = new Date(this.dateLastActivity) >= sevenDaysAgo

        if (hasRecentActivity){
            const crowdinUrl = this.urls.crowdinUrl
            if (crowdinUrl) {
                const crowdinData = await this.getCrowdinData(crowdinUrl) ?? {translationProgress: null, approvalProgress: null}
                return {
                    status: 'pending',
                    translationProgress: crowdinData.translationProgress,
                    approvalProgress: crowdinData.approvalProgress
                }
            } else {
                return {
                    status: 'pending',
                    translationProgress: null,
                    approvalProgress: null
                }
            }
               
        }
        return {status: 'unknown'}
    }
    
}