import { prisma_client } from ".server/db";
const getClientFormData = (formData: FormData) => {
    const fname = (formData.get("fname") as string) || "";
    const lname = (formData.get("lname") as string) || "";
    const mobile_num = (formData.get("mobile_num") as string) || "";
    const area = (formData.get("area") as string) || "";

    return {
        client_fname: fname,
        client_lname: lname,
        client_mobile_num: mobile_num,
        client_area: area,
    };
};

const fetchClientFromId = async (
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




export { fetchClientFromId, getClientFormData };
