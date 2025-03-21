import { Payment, Prisma, TransactionType } from "@prisma/client";

type ProductSaleRecordWithRelations = Prisma.Product_Sale_RecordGetPayload<{
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
}>;

type ProductSaleRecordCreateFormType = {
    amount_charged: number;
    amount_paid: number;
    mobile_num: string;
    transaction_type: TransactionType;

    products_quantity: { product_id: string; quantity: number }[];
    mode_of_payment: Payment;
    isClient: boolean;
};

type ProductSaleRecordFetchErrors = {
    start_date: string[];
    end_date: string[];
    products: string[];
    transaction_types: string[];
    client_mobile_num: string[];
    vendor_mobile_num: string[];
    payment_cleaared: string[];
};

type ProductSaleRecordUpdateErrors = {
    total_amount: string[];

    mobile_num: string[];
    transaction_type: string[];
    products_quantity: string[];
};

type ProductSaleRecordCreateErrors = {
    mobile_num: string[];
    transaction_type: string[];
    amount_charged: string[];
    amount_paid: string[];
    products_quantity: string[];
    isClient: string[];
    mode_of_payment: string[];

}

export type {
    ProductSaleRecordCreateFormType,
    ProductSaleRecordFetchErrors,
    ProductSaleRecordUpdateErrors,
    ProductSaleRecordWithRelations,
    ProductSaleRecordCreateErrors
};

