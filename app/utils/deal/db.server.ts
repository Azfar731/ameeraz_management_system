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

const getActiveDeals = async () => {
    const deals = await prisma_client.deal.findMany({
        where: {
            OR: [
                { activate_till: { gte: new Date() } },
                { activate_till: null },
            ],
        },
    });
    return deals;
};

const getDealsWithServiceRecord = async ({
    start_date,
    end_date,
    get_all = false,
}: {
    get_all: boolean;
    start_date?: Date;
    end_date?: Date;
}) => {
    const date = new Date();

    const deals = await prisma_client.deal.findMany({
        where: get_all ? {auto_generated: false} : {
            activate_till: {
                gte: date,
            },
            auto_generated: false,
        },
        include: {
            records: {
                include: {
                    record: true, // includes full Service_Sale_Record for filtering
                },
            },
        },
    });

    // Filter the records based on created_at manually
    const filteredDeals = deals.map((deal) => ({
        ...deal,
        records: deal.records.filter(({ record }) => {
            const created = record.created_at;
            return (
                (!start_date || created >= start_date) &&
                (!end_date || created <= end_date)
            );
        }),
    }));

    return filteredDeals;
};

export {
    createDeal,
    getActiveDeals,
    getAllDeals,
    getDealFromId,
    getDealsWithServiceRecord,
    updateDeal,
};
