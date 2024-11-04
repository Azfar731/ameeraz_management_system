import { Prisma } from "@prisma/client";

type DealWithServices = Prisma.DealGetPayload<{
    include: {
        services: true;
    };
}>;

export type { DealWithServices };
