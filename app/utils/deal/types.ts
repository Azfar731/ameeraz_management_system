import { Prisma } from "@prisma/client";

type DealWithServices = Prisma.DealGetPayload<{
    include: {
        services: true;
    };
}>;

type DealErrors = {
    deal_name?: string[];
    deal_price?: string[];
    activate_from?: string[];
    activate_till?: string[];
    auto_generated?: string[];
    services?: string[];
};

export type { DealErrors, DealWithServices };
