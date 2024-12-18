import { prisma_client } from "~/.server/db";
import { MenuOption } from "../types";
import { Payment } from "@prisma/client";

async function fetchServiceSaleRecords(
    {
        start_date,
        end_date,
        client_mobile_num,
        deal_ids,
        category_ids,
        employee_ids,
    }: {
        start_date?: Date | undefined;
        end_date?: Date | undefined;
        client_mobile_num?: string | undefined;
        deal_ids?: string[] | undefined;
        category_ids?: string[] | undefined;
        employee_ids?: string[] | undefined;
    },
) {
    return prisma_client.service_Sale_Record.findMany({
        where: {
            created_at: { gte: start_date, lte: end_date },
            client: { client_mobile_num },
            deal_records: {
                some: {
                    deal: {
                        deal_id: { in: deal_ids },
                        services: {
                            some: {
                                category: { cat_id: { in: category_ids } },
                            },
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
            deal_records: true,
            employees: true,
        },
    });
}

const createServiceSaleRecord = async (formData: {
    amount_charged: number;
    amount_paid: number;
    mobile_num: string;
    deals: { id: string; quantity: number }[];

    employees: { id: string; work_share: number }[];
    mode_of_payment: { value: Payment; label: string };
}) => {
    const {
        amount_charged,
        amount_paid,
        mobile_num,
        deals,
        employees,
        mode_of_payment,
    } = formData;

    const record = await prisma_client.service_Sale_Record.create({
        data: {
            total_amount: amount_charged,
            payment_cleared: amount_charged === amount_paid,
            client: {
                connect: { client_mobile_num: mobile_num },
            },
            deal_records: {
                create: deals.map((deal) => ({
                    deal_id: deal.id,
                    quantity: deal.quantity,
                })),
            },
            transactions: {
                create: [{
                    amount_paid,
                    mode_of_payment: mode_of_payment.value,
                }],
            },
            employees: {
                create: employees.map((employee) => ({
                    emp_id: employee.id,
                    work_share: employee.work_share,
                })),
            },
        },
    });
    return record;
};

const getPendingServiceSaleRecords = async () => {
    return await prisma_client.service_Sale_Record.findMany({
        where: {
            payment_cleared: false,
        },
        include: {
            client: true,
            transactions: true,
            deal_records: true,
            employees: {
                include: {
                    employee: true,
                },
            },
        },
    });
};

const getServiceSaleRecordFromId = async ({
    id,
    includeClient = false,
    includeDeals = false,
    includeTransactions = false,
    includeEmployees = false,
}: {
    id: string;
    includeClient?: boolean;
    includeTransactions?: boolean;
    includeEmployees?: boolean;
    includeDeals?: boolean;
}) => {
    return await prisma_client.service_Sale_Record.findFirst({
        where: { service_record_id: id },

        include: {
            client: includeClient,
            deal_records: includeDeals,
            employees: includeEmployees
                ? { include: { employee: true } }
                : false,
            transactions: includeTransactions,
        },
    });
};

export {
    createServiceSaleRecord,
    fetchServiceSaleRecords,
    getPendingServiceSaleRecords,
    getServiceSaleRecordFromId,
};
