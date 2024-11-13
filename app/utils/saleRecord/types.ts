import { Prisma } from "@prisma/client";

type ServiceSaleRecordWithRelations = Prisma.Service_Sale_RecordGetPayload<{
    include: {
        client: true;
        deals: true;
        employees: { include: { employee: true } };
        transactions: true;
    };
}>;

export type { ServiceSaleRecordWithRelations };
