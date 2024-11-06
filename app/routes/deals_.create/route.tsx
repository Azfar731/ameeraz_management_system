import { prisma_client } from "~/.server/db";
import { Service } from "@prisma/client";
import { useLoaderData, useActionData, replace } from "@remix-run/react";
import { DealErrors } from "~/utils/deal/types";
import { fetchActiveServices } from "~/utils/service/functions.server";
import Deal_Form from "~/components/deals/deal_form";
import { ActionFunctionArgs } from "@remix-run/node";
import { getDealFormData } from "~/utils/deal/functions.server";
import { dealSchema } from "~/utils/deal/validation";

export async function loader() {
  const services = await fetchActiveServices();
  return { services };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const dealFormData = getDealFormData(formData);
  const validationResult = dealSchema.safeParse(dealFormData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const newDeal = await create_deal_fn(validationResult.data);

  throw replace(`/deals/${newDeal.deal_id}`);
}

const create_deal_fn = async ({
  deal_name,
  deal_price,
  activate_from,
  activate_till,
  services,
}: {
  deal_name: string;
  deal_price: number;
  activate_from: Date;
  activate_till: Date;
  services: string[];
}) => {
  const newDeal = await prisma_client.deal.create({
    data: {
      deal_name,
      deal_price,
      activate_from,
      activate_till,
      services: {
        connect: services.map((serviceId) => ({ serv_id: serviceId })),
      },
    },
  });

  return newDeal;
};
export default function Create_Deal() {
  const { services } = useLoaderData<{ services: Service[] }>();
  const actionData = useActionData<{ errors: DealErrors }>();

  return (
    <div className="flex justify-center">
      <Deal_Form services={services} errorMessage={actionData?.errors} />
    </div>
  );
}
