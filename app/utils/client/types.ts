import { Prisma } from "@prisma/client";

type ClientErrorData = {
        client_fname?: string[];
        client_lname?: string[];
        client_mobile_num?: string[];
        client_area?: string[];
        subscribed?:string[];
};

type ClientWithRelations = Prisma.ClientGetPayload<{
    include: {
      services: true;
      products: true;
    };
  }>;


export type { ClientErrorData, ClientWithRelations };
