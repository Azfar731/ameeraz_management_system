import { Prisma } from "@prisma/client";

type ProductTransactionWithRelations = Prisma.Product_TransactionGetPayload<{
    include: {
        record: {
            include: {
                client: true;
                vendor: true;
                transactions: true;
                products: {
                    include: {
                        product: true;
                    };
                };
            };
        };
    };
}>;

type ProductTransactionFetchErrorData = {
    start_date: string[];
    end_date: string[];
    client_mobile_num: string[];
    vendor_mobile_num: string[];
    transaction_types: string[];
    products: string[];
    payment_options: string[];
    userType: string[];
};

export type {
    ProductTransactionFetchErrorData,
    ProductTransactionWithRelations,
};
