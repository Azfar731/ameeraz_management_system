import { Payment, Prisma, TransactionType } from "@prisma/client";
type ProductSaleRecordWithRelations = Prisma.Product_Sale_RecordGetPayload<{
    include:{
        client: true,
        vendor: true,
        transactions: true,
        products: {
            include: {
                product: true
            }
        },
    }
}>


type ProductSaleRecordCreateFormType = {
    amount_charged: number;
    amount_paid: number;
    mobile_num: string;
    transaction_type: TransactionType;
    products: string[];
    mode_of_payment: Payment;
}


type ProductSaleRecordFetchErrors = {
    start_date: string[];
    end_date: string[];
    products: string[];
    transaction_types: string[]
    client_mobile_num: string[]
    vendor_mobile_num: string[]
}


export type { ProductSaleRecordCreateFormType, ProductSaleRecordFetchErrors, ProductSaleRecordWithRelations };
