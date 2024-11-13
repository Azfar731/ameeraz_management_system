import { prisma_client } from "~/.server/db";
import { PaymentModes } from "../types";

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
                    include: { deals: true, client: true },
                }
                : false,
        },
    });
};

export { getClientTransactionFromID, getClientTransactions };
