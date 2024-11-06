import { prisma_client } from "~/.server/db";

const fetchServiceFromId = async (
  { id, includeCategory }: { id: string; includeCategory: boolean },
) => {
  const service = await prisma_client.service.findFirst({
    where: { serv_id: id },
    include: {
      category: includeCategory,
      deals: { where: { auto_generated: true } },
    },
  });
  return service;
};

const getServiceFormData = (formData: FormData) => {
  const serv_name = (formData.get("name") as string) || "";
  const serv_price = parseInt((formData.get("price") as string) || "0", 10);
  const serv_category = (formData.get("category") as string) || "";
  const isInactive =
    (formData.get("status") as string)?.toLowerCase() === "false";
  const serv_status = !isInactive;

  return {
    serv_name,
    serv_price,
    serv_category,
    serv_status,
  };
};

const fetchActiveServices = async () => {
  const deals = await prisma_client.deal.findMany({
    where: { auto_generated: true, activate_till: null },
    include: { services: true },
  });
  //fetch services from deals. Each deal only has one attached service
  const services = deals.map((deal) => deal.services[0]);

  return services;
};

export { fetchActiveServices, fetchServiceFromId, getServiceFormData };
