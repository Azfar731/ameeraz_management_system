import { prisma_client } from "~/.server/db";
import { Category } from "@prisma/client";
const getCategoryFromId = async (
    { id, include_services }: { id: string; include_services: boolean },
) => {
    const category = await prisma_client.category.findFirst({
        where: { cat_id: id },
        include: { services: include_services },
    });
    return category;
};

const createCategory = async ({ cat_name }: Omit<Category, "cat_id">) => {
    const category = await prisma_client.category.create({
        data: {
            cat_name: (cat_name.toLowerCase()),
        },
    });
    return category;
};

const updateCategory = async ({
    cat_name,
    cat_id,
}: Category) => {
    const category = await prisma_client.category.update({
        where: { cat_id },
        data: {
            cat_name: (cat_name.toLowerCase()),
        },
    });
    return category;
};

const getAllCategories = async () => {
    const categories = await prisma_client.category.findMany();
    return categories;
};

export { createCategory, getAllCategories, getCategoryFromId, updateCategory };
