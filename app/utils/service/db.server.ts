import { prisma_client } from "~/.server/db";
import { Service } from "@prisma/client";
const getServiceFromId = async (
    { id, includeCategory }: { id: string; includeCategory: boolean },
) => {
    const service = await prisma_client.service.findFirst({
        where: { serv_id: id },
        include: {
            category: includeCategory,
            deals: { where: { auto_generated: true } },
        },
    });
    return service;
};

const getActiveServices = async () => {
    const deals = await prisma_client.deal.findMany({
        where: { auto_generated: true, activate_till: null },
        include: { services: true },
    });
    //fetch services from deals. Each deal only has one attached service
    const services = deals.map((deal) => deal.services[0]);

    return services;
};

const createService = async ({
    serv_name,
    serv_category,
    serv_price,
}: Omit<Service, "serv_id" | "created_at">) => {
    const capitalized_name = serv_name.toLowerCase();
    const current_date = new Date();
    const service = await prisma_client.service.create({
        data: {
            serv_name: capitalized_name,
            serv_category,
            serv_price,
            deals: {
                create: [
                    {
                        deal_name: capitalized_name,
                        deal_price: serv_price,
                        activate_from: current_date,
                        auto_generated: true,
                    },
                ],
            },
        },
    });
    return service;
};

const updateService = async ({
    serv_id,
    serv_name,
    serv_category,
    serv_price,
    serv_status,
}: Omit<Service, "created_at"> & { serv_status: boolean }) => {
    const lowerCaseName = serv_name.toLowerCase();
    const current_date = new Date();
    const service = await prisma_client.service.update({
        where: { serv_id },
        data: {
            serv_name: lowerCaseName,
            serv_category,
            serv_price,
        },
    });
    const deal = await prisma_client.deal.findFirst({
        where: {
            services: {
                some: {
                    serv_id,
                },
            },
            auto_generated: true,
        },
    });
    //if serv_status is false, it means that the service has been updated
    // to be inactive, so we assign activate_till a value of current date
    await prisma_client.deal.update({
        where: { deal_id: deal?.deal_id },
        data: {
            deal_name: lowerCaseName,
            deal_price: serv_price,
            activate_till: serv_status ? null : current_date,
        },
    });

    return service;
};

export { createService, getActiveServices, getServiceFromId, updateService };
