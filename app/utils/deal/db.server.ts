import { prisma_client } from "~/.server/db";
import { Deal } from "@prisma/client";
const getDealFromId = async (
    { id, includeServices }: { id: string; includeServices: boolean },
) => {
    const deal = await prisma_client.deal.findFirst({
        where: { deal_id: id },
        include: { services: includeServices },
    });

    return deal;
};

const createDeal = async ({
    deal_name,
    deal_price,
    activate_from,
    activate_till,
    services,
}: Omit<Deal, "deal_id" | "created_at" | "modified_at" | "auto_generated"> & {
    services: string[];
}) => {
    const newDeal = await prisma_client.deal.create({
        data: {
            deal_name: deal_name.toLowerCase(),
            deal_price,
            activate_from,
            activate_till,
            services: {
                connect: services.map((serviceId) => ({ serv_id: serviceId })),
            },
        },
    });

    return newDeal;
};

const updateDeal = async ({
    deal_id,
    deal_name,
    deal_price,
    activate_from,
    activate_till,
    services,
}: Omit<Deal, "created_at" | "modified_at" | "auto_generated"> & {
    services: string[];
}) => {
    const newDeal = await prisma_client.deal.update({
        where: { deal_id },
        data: {
            deal_name: deal_name.toLowerCase(),
            deal_price,
            activate_from,
            activate_till,
            services: {
                set: services.map((serviceId) => ({ serv_id: serviceId })),
            },
        },
    });

    return newDeal;
};

const getAllDeals = async () => {
    const deals = await prisma_client.deal.findMany();
    return deals;
};

const getActiveDeals = async() => {
    
    const deals = await prisma_client.deal.findMany({
        where: {
            OR: [
                { activate_till: { gte: new Date() } },
                { activate_till: null }
            ]
        }
    })
    return deals;
}

export { createDeal, getDealFromId, updateDeal, getAllDeals, getActiveDeals };
