import { prisma_client } from "~/.server/db";
import { Boolean_Strings, Client } from "@prisma/client";
async function findClientByMobile(mobile_num: string) {
    return prisma_client.client.findFirst({
        where: { client_mobile_num: mobile_num },
    });
}

const createClient = async ({
    client_fname,
    client_lname,
    client_mobile_num,
    client_area,
    subscribed = "true",
}: Omit<Client, "client_id" | "created_at" | "points" | "subscribed"> & {
    subscribed?: Boolean_Strings;
}) => {
    const client = await prisma_client.client.create({
        data: {
            client_fname: (client_fname.toLowerCase()),
            client_lname: (client_lname.toLowerCase()),
            client_area,
            client_mobile_num,
            subscribed,
        },
    });
    return client;
};

const updateClient = async ({
    client_fname,
    client_lname,
    client_mobile_num,
    client_area,
    client_id,
    subscribed,
}: Omit<Client, "created_at" | "points">) => {
    const updatedClient = await prisma_client.client.update({
        where: {
            client_id, // The unique identifier for the client record you want to update
        },
        data: {
            client_fname: (client_fname.toLowerCase()),
            client_lname: (client_lname.toLowerCase()),
            client_mobile_num,
            client_area,
            subscribed,
        },
    });
    return { updatedClient };
};

const getClientFromId = async (
    { id, includeServices = false, includeProducts = false }: {
        id: string;
        includeProducts?: boolean;
        includeServices?: boolean;
    },
) => {
    const client = await prisma_client.client.findFirst({
        where: { client_id: id },
        include: {
            services: includeServices ? true : undefined,
            products: includeProducts ? true : undefined,
        },
    });
    return client;
};

const changeClientSubscribeStatus = async (
    { status, mobile_num }: { status: boolean; mobile_num: string },
) => {
    return await prisma_client.client.update({
        where: {
            client_mobile_num: _removeInternationalCode(mobile_num),
        },
        data: {
            subscribed: status ? "true" : "false",
        },
    });
};

function _removeInternationalCode(mobile_num: string) {
    if (mobile_num.startsWith("92") && mobile_num.length === 12) {
        return "0" + mobile_num.slice(2);
    }
    return mobile_num;
}

const getClients = async ({
    client_mobile_num,
    client_fname,
    client_lname,
    subscribed,
    client_areas,
}: {
    client_mobile_num?: string;
    client_fname?: string ;
    client_lname?: string ;
    subscribed?: Boolean_Strings;
    client_areas?: string[];
}) => {
    if (client_mobile_num) {
        const client = await prisma_client.client.findFirst({
            where: {
                client_mobile_num: client_mobile_num,
            },
        });

        return client ? [client] : [];
    } else {
        console.log("Areas: ", client_areas);
        const clients = await prisma_client.client.findMany({
            where: {
                client_area: { in: client_areas },
                client_fname: client_fname?.toLowerCase(),
                client_lname: client_lname?.toLowerCase(),
                subscribed: subscribed,
            },
        });

        return clients;
    }
};

const getClientCount = async () => {
    const count = await prisma_client.client.count();
    return count;
};

const getRangeofClients = async (
    { startIndex, total }: { startIndex: number; total: number },
) => {
    const clients = await prisma_client.client.findMany({
        where: { subscribed: "true" },
        orderBy: { created_at: "asc" }, // Sort in ascending order
        skip: startIndex, // Skip the first 250 clients
        take: total, // Fetch the next 50 clients (from 251 to 300)
    });
    return clients;
};

export {
    changeClientSubscribeStatus,
    createClient,
    findClientByMobile as getClientByMobile,
    getClientCount,
    getClientFromId,
    getClients,
    getRangeofClients,
    updateClient,
};
