import { Prisma } from "@prisma/client";



export type BalanceTransactionWithRelations = Prisma.Balance_TransactionGetPayload<{
    include: {
        user: true;
    }
}>


