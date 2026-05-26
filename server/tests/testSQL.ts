import { getActiveProducts, getCount, getProductCount } from "../services/functions.js";
import type { ApiFilters } from "../../shared/types.js";
const filters: Partial<ApiFilters> = {
        lang: undefined,
        code: undefined,
        group: undefined,
        from: undefined,
        to: undefined
    }

const productCount = await getProductCount(filters)
    


console.log(productCount)