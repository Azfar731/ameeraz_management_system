import { prisma_client } from "~/.server/db";

async function fetchServiceSaleRecords(
    {
       start_date,
       end_date,
       client_mobile_num,
       deal_ids,
       category_ids,
       employee_ids, 
    }:{
    start_date?: Date | undefined,
    end_date?: Date | undefined,
    client_mobile_num?: string | undefined,
    deal_ids?: string[] | undefined,
    category_ids?: string[] | undefined,
    employee_ids?: string[] | undefined,}
) {
    return prisma_client.service_Sale_Record.findMany({
        where: {
            created_at: { gte: start_date, lte: end_date },
            client: { client_mobile_num },
            deals: {
                some: {
                    deal_id: { in: deal_ids },
                    services: {
                        some: {
                            category: { cat_id: { in: category_ids } },
                        },
                    },
                },
            },
            employees: {
                some: { emp_id: { in: employee_ids } },
            },
        },
        include: {
            client: true,
            transactions: true,
            deals: true,
            employees: true,
        },
    });
}

export {  fetchServiceSaleRecords };
