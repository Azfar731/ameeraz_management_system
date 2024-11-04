import { Prisma } from "@prisma/client";

type ServiceWithRelations = Prisma.ServiceGetPayload<{
    include: {
        category: true;
        deals: true;
    };
}>;


type ServiceErrors = {
    serv_name?: string[];
    serv_price?: string[];
    serv_category?: string[];
};


export type { ServiceWithRelations, ServiceErrors };
