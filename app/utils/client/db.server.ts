import { prisma_client } from "~/.server/db";
import { Client } from "@prisma/client";
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
}: Omit<Client, "client_id" | "created_at" | "points">) => {
    const client = await prisma_client.client.create({
        data: {
            client_fname: (client_fname.toLowerCase()),
            client_lname: (client_lname.toLowerCase()),
            client_area,
            client_mobile_num,
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

const getClients = async (
    mobile_num: string | undefined,
    fname: string | undefined,
    lname: string | undefined,
    areas: string[] | undefined,
) => {
    if (mobile_num) {
        const client = await prisma_client.client.findFirst({
            where: {
                client_mobile_num: mobile_num,
            },
        });

        return client ? [client] : [];
    } else {
        console.log("Areas: ", areas);
        const clients = await prisma_client.client.findMany({
            where: {
                client_area: { in: areas },
                client_fname: fname?.toLowerCase(),
                client_lname: lname?.toLowerCase(),
            },
        });

        return clients;
    }
};

export {
    createClient,
    findClientByMobile,
    getClientFromId,
    getClients,
    updateClient,
};
