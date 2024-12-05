import { Payment, TransactionType } from "@prisma/client";
import { prisma_client } from "~/.server/db";
import { getProductSaleRecordPendingAmount } from "./functions.server";

const getProductTransactions = async ({
    start_date,
    end_date,
    client_mobile_num,
    vendor_mobile_num,
    transaction_types,
    products,
    payment_options,
    userType,
}: {
    start_date?: Date;
    end_date?: Date;
    client_mobile_num?: string;
    vendor_mobile_num?: string;
    payment_options?: Payment[];
    transaction_types?: TransactionType[];
    products?: string[];
    userType?: "client" | "vendor";
}) => {
    return await prisma_client.product_Transaction.findMany({
        where: {
            created_at: { gte: start_date, lte: end_date },
            mode_of_payment: payment_options
                ? { in: payment_options }
                : undefined,
            record: {
                transaction_type: transaction_types
                    ? { in: transaction_types }
                    : undefined,
                client: client_mobile_num
                    ? { client_mobile_num: client_mobile_num }
                    : userType === "client"
                    ? { isNot: null }
                    : undefined,
                vendor: vendor_mobile_num
                    ? { vendor_mobile_num: vendor_mobile_num }
                    : userType === "vendor"
                    ? { isNot: null }
                    : undefined,
                products: products
                    ? {
                        some: {
                            prod_id: { in: products },
                        },
                    }
                    : undefined,
            },
        },
        include: {
            record: {
                include: {
                    vendor: true,
                    products: { include: { product: true } },
                    client: true,
                    transactions: true,
                },
            },
        },
    });
};

const getProductTransactionWithRelationsFromId = async (
    product_trans_id: string,
) => {
    return await prisma_client.product_Transaction.findUnique({
        where: { product_trans_id },
        include: {
            record: {
                include: {
                    client: true,
                    vendor: true,
                    transactions: true,
                    products: {
                        include: {
                            product: true,
                        },
                    },
                },
            },
        },
    });
};

const getProductTransactionFromId = async (
    product_trans_id: string,
) => {
    return await prisma_client.product_Transaction.findUnique({
        where: { product_trans_id },
    });
};

const createProductTransaction = async (
    { amount_paid, mode_of_payment, product_record_id }: {
        amount_paid: number;
        mode_of_payment: Payment;
        product_record_id: string;
    },
) => {
    //fetch product record
    const new_remaining_amount =
        (await getProductSaleRecordPendingAmount(product_record_id)) -
        amount_paid;

    return await prisma_client.$transaction(async (tx) => {
        const transaction = await tx.product_Transaction.create({
            data: {
                amount_paid,
                mode_of_payment,
                record_id: product_record_id,
            },
        });

        if (new_remaining_amount === 0) {
            await prisma_client.product_Sale_Record.update({
                where: { product_record_id },
                data: { payment_cleared: true },
            });
        }

        return transaction;
    });
};

const updateProductTransaction = async (
    {
        id,
        amount_paid,
        mode_of_payment,
        new_remaining_amount,
    }: {
        id: string;
        amount_paid: number;
        mode_of_payment: Payment;
        new_remaining_amount: number;
    },
) => {
    return await prisma_client.product_Transaction.update({
        where: { product_trans_id: id },
        data: {
            amount_paid,
            mode_of_payment,
            record: {
                update: {
                    payment_cleared: new_remaining_amount - amount_paid === 0,
                },
            },
        },
    });
};

export {
    createProductTransaction,
    getProductTransactionFromId,
    getProductTransactions,
    getProductTransactionWithRelationsFromId,
    updateProductTransaction,
};

