import { prisma_client } from "~/.server/db";
import { Service } from "@prisma/client";
import { useLoaderData, useActionData, replace } from "@remix-run/react";
import { DealErrors, DealWithServices } from "~/utils/deal/types";
import { fetchActiveServices } from "~/utils/service/functions.server";
import Deal_Form from "~/components/deals/deal_form";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  fetchDealFromId,
  getDealFormData,
} from "~/utils/deal/functions.server";
import { dealSchema } from "~/utils/deal/validation";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Id parameter not found in URL");
  }
  const deal = await fetchDealFromId({ id, includeServices: true });
  if (!deal) {
    throw new Error(`No deal found with id: ${id}`);
  }
  const services = await fetchActiveServices();
  return { deal, services };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No id provided in the URL");
  }
  const formData = await request.formData();
  const dealFormData = getDealFormData(formData);
  const validationResult = dealSchema.safeParse(dealFormData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const newDeal = await update_deal_fn({
    deal_id: id,
    ...validationResult.data,
  });

  throw replace(`/deals/${newDeal.deal_id}`);
}

const update_deal_fn = async ({
  deal_id,
  deal_name,
  deal_price,
  activate_from,
  activate_till,
  services,
}: {
  deal_id: string;
  deal_name: string;
  deal_price: number;
  activate_from: Date;
  activate_till: Date;
  services: string[];
}) => {
  const newDeal = await prisma_client.deal.update({
    where: { deal_id },
    data: {
      deal_name,
      deal_price,
      activate_from,
      activate_till,
      services: {
        set: services.map((serviceId) => ({ serv_id: serviceId })),
      },
    },
  });

  return newDeal;
};
export default function Update_Deal() {
  const loaderData = useLoaderData<{
    deal: DealWithServices;
    services: Service[];
  }>();
  const actionData = useActionData<{ errors: DealErrors }>();
  const services = loaderData.services;

  //convert date strings back to dates
  const deal = {
    ...loaderData.deal,
    created_at: new Date(loaderData.deal.created_at),
    modified_at: new Date(loaderData.deal.modified_at),
    activate_from: new Date(loaderData.deal.activate_from),
    activate_till: loaderData.deal.activate_till
      ? new Date(loaderData.deal.activate_till)
      : null,
  };

  return (
    <div className="flex justify-center">
      <Deal_Form
        deal={deal}
        services={services}
        errorMessage={actionData?.errors}
      />
    </div>
  );
}
