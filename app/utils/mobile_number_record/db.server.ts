import { Boolean_Strings } from "@prisma/client";
import { prisma_client } from "~/.server/db";

const createMobileRecord = async (mobile_number: string) => {
    await prisma_client.mobile_number_record.create({
        data: {
            mobile_number,
        },
    });
};

const getMobileNumbersCount = async () => {
    const count = await prisma_client.mobile_number_record.count();
    return count;
};

const getRangeofNumberRecords = async (
    { startIndex, total }: { startIndex: number; total: number },
) => {
    const records = await prisma_client.mobile_number_record.findMany({
        where: { subscribed: "true" },
        orderBy: { created_at: "asc" }, // Sort in ascending order
        skip: startIndex,
        take: total,
    });
    return records;
};

const changeNumberSubscribeStatus = async (
    { phoneNumber, status }: { status: Boolean_Strings; phoneNumber: string },
) => {
    return await prisma_client.mobile_number_record.update({
        where: { mobile_number: phoneNumber },
        data: { subscribed: status },
    });
};

const getRecord = async (phoneNumber: string) => {
    return await prisma_client.mobile_number_record.findFirst({
        where: { mobile_number: phoneNumber },
    });
};

export {
    changeNumberSubscribeStatus,
    getMobileNumbersCount,
    getRangeofNumberRecords,
    getRecord,
    createMobileRecord
};
