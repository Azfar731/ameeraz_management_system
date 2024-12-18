import { Prisma } from "@prisma/client";

type ServiceSaleRecordFetchErrors = {
    start_date: string[];
    end_date: string[];
    client_mobile_num: string[];
    category_ids: string[];
    employee_ids: string[];
    deal_ids: string[];
};

type ServiceSaleRecordCreateErrors = {
    amount_charged: string[];
    amount_paid: string[];
    mobile_num: string[];
    deals: string[];
    services: string[];
    employees: string[];
    mode_of_payment: string[];
};

type ServiceSaleRecordWithRelations = Prisma.Service_Sale_RecordGetPayload<{
    include: {
        client: true;
        deal_records: {include: { deal: true }};
        employees: { include: { employee: true } };
        transactions: true;
    };
}>;

export type {
    ServiceSaleRecordCreateErrors,
    ServiceSaleRecordFetchErrors,
    ServiceSaleRecordWithRelations,
};
