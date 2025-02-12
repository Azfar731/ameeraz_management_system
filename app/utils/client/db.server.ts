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

const changeClientSubscribeStatus = async({status, mobile_num}:{status: boolean, mobile_num: string})=>{
    return await prisma_client.client.update({
        where: {
            client_mobile_num: _removeInternationalCode(mobile_num),
        },
        data:{
            subscribed: status? "true" : "false"
        }
    })

}

function _removeInternationalCode(mobile_num: string){
    if (mobile_num.startsWith("92") && mobile_num.length === 12) {
        return "0" + mobile_num.slice(2);
    }
    return mobile_num;
}

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


const getClientCount = async () => {
    const count = await prisma_client.client.count();
    return count;
};


const getRangeofClients = async({startIndex,total}:{startIndex: number;total: number})=> {
    const clients = await prisma_client.client.findMany({
        orderBy: { created_at: "asc" },  // Sort in ascending order
        skip: startIndex,  // Skip the first 250 clients
        take: total,   // Fetch the next 50 clients (from 251 to 300)
      });
    return clients
}  

export {
    createClient,
    findClientByMobile as getClientByMobile,
    getClientFromId,
    getClients,
    updateClient,
    getClientCount,
    getRangeofClients,
    changeClientSubscribeStatus
};
