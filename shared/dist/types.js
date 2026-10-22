import * as z from "zod";
// Sub-domain: Trello
const TrelloDataSchema = z.object({
    id: z.string(),
    url: z.string(),
    title: z.string(),
    localizedTitle: z.string(),
    productCode: z.string().nullable(),
    targetLanguage: z.string().nullable(),
    dueDate: z.iso.datetime().nullable(),
    datePublished: z.iso.datetime().nullable(),
    dateLastActivity: z.iso.datetime().nullable(),
    dateArchived: z.iso.datetime().nullable(),
    mediaGroups: z.array(z.string()),
    editorUrl: z.string().nullable(),
    articleUrl: z.string().nullable(),
    wordCount: z.number().int().nullable(),
});
// Sub-domain: YouTube
const YouTubeDataSchema = z.object({
    id: z.string(),
    localizedTitle: z.string().nullable(),
    url: z.string(),
    durationSeconds: z.number().int().nullable(),
});
// Sub-domain: Crowdin
const CrowdinDataSchema = z.object({
    id: z.string(),
    translationProgress: z.number().nullable(),
    approvalProgress: z.number().nullable(),
    crowdinUrl: z.string(),
});
export class LangOpsApiError extends Error {
    errorCode;
    constructor(errorCode, message) {
        super(message);
        this.name = "LangOpsApiError";
        this.errorCode = errorCode;
    }
}
//# sourceMappingURL=types.js.map