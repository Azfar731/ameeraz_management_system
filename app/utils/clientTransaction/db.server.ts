import { prisma_client } from "~/.server/db";
import { PaymentModes } from "../types";
import { getServiceSaleRecordFromId } from "../saleRecord/db.server";

const getClientTransactions = async ({
    start_date,
    end_date,
    mobile_num,
    payment_options,
}: {
    start_date?: Date;
    end_date?: Date;
    mobile_num?: string;
    payment_options?: PaymentModes[];
}) => {
    return await prisma_client.client_Transaction.findMany({
        where: {
            mode_of_payment: payment_options
                ? { in: payment_options }
                : undefined,
            created_at: { gte: start_date, lte: end_date },
            record: {
                client: {
                    client_mobile_num: mobile_num,
                },
            },
        },
        include: {
            record: {
                include: { deals: true, client: true },
            },
        },
    });
};

const getClientTransactionFromID = async (
    { id, includeRecord = false }: { id: string; includeRecord?: boolean },
) => {
    return await prisma_client.client_Transaction.findFirst({
        where: { client_transaction_id: id },
        include: {
            record: includeRecord
                ? {
                    include: { deals: true, client: true, transactions: true },
                }
                : false,
        },
    });
};

const createClientTransaction = async (
    { amount_paid, mode_of_payment, service_record_id }: {
        amount_paid: number;
        mode_of_payment: PaymentModes;
        service_record_id: string;
    },
) => {
    const service_sale_record = await getServiceSaleRecordFromId({
        id: service_record_id,
        includeTransactions: true,
    });
    if (!service_sale_record) {
        throw new Error(
            `No Service Sale Record Exists with id: ${service_record_id}`,
        );
    }

    const new_remaining_amount = service_sale_record.total_amount -
        (service_sale_record.transactions.reduce((sum, trans) => {
            return sum + trans.amount_paid;
        }, 0) + amount_paid);

    const payment_cleared = new_remaining_amount === 0;

    return await prisma_client.$transaction(async (tx) => {
        const transaction = await tx.client_Transaction.create({
            data: {
                amount_paid,
                mode_of_payment,
                record_id: service_record_id,
            },
        });

        if (payment_cleared) {
            await prisma_client.service_Sale_Record.update({
                where: { service_record_id },
                data: { payment_cleared: true },
            });
        }
        
        return transaction;
    });


};

export {
    createClientTransaction,
    getClientTransactionFromID,
    getClientTransactions,
};
