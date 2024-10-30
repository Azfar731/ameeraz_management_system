import { prisma_client } from ".server/db";

const fetchClients = async (
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
                client_fname: fname,
                client_lname: lname,
            },
        });

        return clients;
    }
};

export { fetchClients };
