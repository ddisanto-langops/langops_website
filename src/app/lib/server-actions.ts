"use server"

import { apiRequest } from "./langops-api";
import { revalidatePath } from "next/cache";

export async function restoreProduct(id: string) {
    await apiRequest(`products/restore/${id}`, {method: 'PATCH'})
    revalidatePath('/products')
}