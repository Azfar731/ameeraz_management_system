import { prisma_client } from "~/.server/db";

const getCategoryFromId = async (
    { id, include_services }: { id: string; include_services: boolean },
) => {
    const category = await prisma_client.category.findFirst({
        where: { cat_id: id },
        include: { services: include_services },
    });
    return category;
};

const createCategory = async ({ cat_name }: { cat_name: string }) => {
    const category = await prisma_client.category.create({
        data: {
            cat_name: (cat_name.toLowerCase()),
        },
    });
    return category;
};

const updateCategory = async ({
    cat_name,
    id,
}: {
    cat_name: string;
    id: string;
}) => {
    const category = await prisma_client.category.update({
        where: { cat_id: id },
        data: {
            cat_name: (cat_name.toLowerCase()),
        },
    });
    return category;
};

export { createCategory, getCategoryFromId, updateCategory };
