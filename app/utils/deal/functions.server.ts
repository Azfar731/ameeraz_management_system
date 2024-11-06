import { prisma_client } from "~/.server/db";

const fetchDealFromId = async (
    { id, includeServices }: { id: string; includeServices: boolean },
) => {
    const deal = await prisma_client.deal.findFirst({
        where: { deal_id: id },
        include: { services: includeServices },
    });

    return deal;
};

const getDealFormData = (formData: FormData) => {
    const deal_name = formData.get("name") as string;
    const deal_price = formData.get("price") as string;
    const services = formData.get("services") as string;
    const activate_from = formData.get("startDate") as string;
    const activate_till = formData.get("endDate") as string;

    return {
        deal_name,
        deal_price,
        services,
        activate_from,
        activate_till,
    };
};

export { fetchDealFromId, getDealFormData };
