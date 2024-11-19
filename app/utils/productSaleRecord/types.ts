import { Prisma } from "@prisma/client";

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

type ProductSaleRecordFetchErrors = {
    start_date: string[];
    end_date: string[];
    products: string[];
    transaction_types: string[]
    client_mobile_num: string[]
    vendor_mobile_num: string[]
}


export type {ProductSaleRecordWithRelations, ProductSaleRecordFetchErrors}