import { Log_Type, Logs } from "@prisma/client";
import { prisma_client } from "~/.server/db";

const createLog = async (logData: Omit<Logs, "id" | "created_at">) => {
    return await prisma_client.logs.create({ data: logData });
};

const getAllLogs = async () => {
    return await prisma_client.logs.findMany();
};

const getLogs = async ({
    startDate,
    endDate,
    userId,
    log_type,
    userName,
}: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    log_type?: Log_Type[];
    userName?: string;
}) => {
    return await prisma_client.logs.findMany({
        where: {
            created_at: {
                gte: startDate,
                lte: endDate,
            },
            userId: userId,
            user: { userName },
            log_type: { in: log_type },
        },
        include: {
            user: true,
        },
    });
};

export { createLog, getAllLogs, getLogs };
