import { Prisma } from "@prisma/client";

type ClientTransactionWithRelations = Prisma.Client_TransactionGetPayload<{
    include: {
      record: {
        include: {
          deals: true;
          client: true;
        };
      };
    };
  }>;


export type {ClientTransactionWithRelations}