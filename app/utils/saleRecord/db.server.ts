import { prisma_client } from "~/.server/db";

const getPendingServiceSaleRecords = async () => {
    return await prisma_client.service_Sale_Record.findMany({
        where: {
            payment_cleared: false,
        },
        include: {
            client: true,
            transactions: true,
            deals: true,
            employees: {
                include: {
                    employee: true,
                },
            },
        },
    });
};

export { getPendingServiceSaleRecords };
