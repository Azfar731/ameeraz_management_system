import { Prisma } from "@prisma/client";

type LogWithRelations = Prisma.LogsGetPayload<{
    include: {
        user: true;
    };
}>;

// Extend the type by adding `created_at_local`
type LogWithLocalTime = LogWithRelations & {
    created_at_local: string;
};

type LogErrorMessages = {
    start_date?: string[];
    end_date?: string[];
    userId?: string[];
    userName?: string[];
    log_type?: string[];
};

export type { LogErrorMessages, LogWithRelations , LogWithLocalTime};
