import { Prisma } from "@prisma/client";

type ClientErrorData = {
    errors?: {
        client_fname?: string[];
        client_lname?: string[];
        client_mobile_num?: string[];
        client_area?: string[];
    };
};

type ClientWithRelations = Prisma.ClientGetPayload<{
    include: {
      services: true;
      products: true;
    };
  }>;


export type { ClientErrorData, ClientWithRelations };
