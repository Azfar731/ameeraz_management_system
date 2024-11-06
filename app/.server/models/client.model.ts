import { prisma_client } from "~/.server/db";
import { ClientValues } from "~/utils/types";
import { capitalizeFirstLetter } from "~/utils/functions";

const create_client_fn = async ({
    client_fname,
    client_lname,
    client_mobile_num,
    client_area,
}: ClientValues) => {
    const client = await prisma_client.client.create({
        data: {
            client_fname: capitalizeFirstLetter(client_fname.toLowerCase()),
            client_lname: capitalizeFirstLetter(client_lname.toLowerCase()),
            client_area,
            client_mobile_num,
        },
    });
    return client;
};

export { create_client_fn };
