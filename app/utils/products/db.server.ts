import { Product } from "@prisma/client";
import { prisma_client } from "~/.server/db";

const getAllProducts = async () => {
    return await prisma_client.product.findMany();
};

const getProductFromId = async (
    { id, includeRelations = false }: {
        id: string;
        includeRelations?: boolean;
    },
) => {
    return await prisma_client.product.findFirst({
        where: { prod_id: id },
        include: {
            records: includeRelations,
        },
    });
};

const createProduct = async (
    { prod_name, quantity }: Omit<Product, "prod_id">,
) => {
    return await prisma_client.product.create({
        data: {
            prod_name: prod_name.toLowerCase(),
            quantity,
        },
    });
};

const updateProduct = async ({ prod_id, prod_name, quantity }: Product) => {
    return await prisma_client.product.update({
        where: { prod_id },
        data: {
            prod_name: prod_name.toLowerCase(),
            quantity,
        },
    });
};

export { createProduct, getAllProducts, getProductFromId, updateProduct };
