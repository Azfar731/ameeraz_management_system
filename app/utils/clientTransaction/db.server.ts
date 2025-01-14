import { prisma_client } from "~/.server/db";
import { PaymentModes } from "../types";
import { getPendingAmount } from "../serviceSaleRecord/functions.server";

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
                include: { deal_records: { include: { deal: true} }, client: true },
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
                    include: {
                        deal_records: { include: { deal: true} },
                        client: true,
                        transactions: true,
                    },
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
    const new_remaining_amount = (await getPendingAmount(service_record_id)) -
        amount_paid;

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

const updateClientTransaction = async (
    {
        id,
        amount_paid,
        mode_of_payment,
        new_remaining_amount,
    }: {
        id: string;
        amount_paid: number;
        mode_of_payment: PaymentModes;
        new_remaining_amount: number;
    },
) => {
    const payment_cleared = new_remaining_amount - amount_paid === 0;

    const updated_transaction = await prisma_client.client_Transaction.update({
        where: { client_transaction_id: id },
        data: {
            amount_paid,
            mode_of_payment,
            record: {
                update: { payment_cleared: payment_cleared },
            },
        },
    });

    return updated_transaction;
};

export {
    createClientTransaction,
    getClientTransactionFromID,
    getClientTransactions,
    updateClientTransaction,
};
