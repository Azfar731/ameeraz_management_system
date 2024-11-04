import { prisma_client } from ".server/db";

const fetchCategoryFromId = async ({id, include_services}: {id: string, include_services: boolean}) => {
    const category = await prisma_client.category.findFirst({
        where: { cat_id: id },
        include: { services: include_services },
    });
    return category;
};


export {fetchCategoryFromId}