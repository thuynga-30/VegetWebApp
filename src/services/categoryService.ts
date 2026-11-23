import api from "@/lib/api";
import type { Category } from "@/types/category";

export const categoryService = {
    getAll: () =>
        api.get("/categories") as Promise<Category[]>,
};