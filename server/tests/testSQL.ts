import { getActiveProducts, getCount, getFilteredCompletions, getProductCount } from "../services/functions.js";
import type { ApiFilters } from "../../shared/types.js";
const filters: Partial<ApiFilters> = {
        lang: "French",
        code: undefined,
        group: ["website", "interpretation"],
        from: undefined,
        to: undefined
    }

const productCount = await getProductCount(filters)
    


console.log(productCount)