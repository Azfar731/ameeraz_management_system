import { Prisma } from "@prisma/client";

type ClientTransactionWithRelations = Prisma.Client_TransactionGetPayload<{
    include: {
        record: {
            include: {
                deals: true;
                client: true;
                transactions: true;
            };
        };
    };
}>;

type ClientTransactionErrors = {
    amount_paid: string[];
    mode_of_payment: string[];
}


export type {ClientTransactionWithRelations, ClientTransactionErrors}