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

const getServiceSaleRecordFromId = async ({id, includeClient= false, includeDeals = false, includeTransactions=false, includeEmployees=false}: {id: string, includeClient?: boolean, includeTransactions?: boolean, includeEmployees?: boolean, includeDeals?: boolean}) => {
    return await prisma_client.service_Sale_Record.findFirst({
        where: { service_record_id: id },
        
        include: {
          client: includeClient,
          deals: includeDeals,
          employees: includeEmployees ? { include: { employee: true } }: false,
          transactions: includeTransactions,
        },
      });
}



export { getPendingServiceSaleRecords, getServiceSaleRecordFromId };
