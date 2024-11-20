import { prisma_client } from "~/.server/db";

async function findClientByMobile(mobile_num: string) {
    return prisma_client.client.findFirst({
        where: { client_mobile_num: mobile_num },
    });
}

export { findClientByMobile };
