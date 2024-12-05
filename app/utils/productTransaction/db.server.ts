import { Payment, TransactionType } from "@prisma/client";
import { prisma_client } from "~/.server/db";

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
                },
            },
        },
    });
};

const getProductTransactionWithRelationsFromId = async (
    product_trans_id: string,
) => {
    return prisma_client.product_Transaction.findUnique({
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

export { getProductTransactions, getProductTransactionWithRelationsFromId };
