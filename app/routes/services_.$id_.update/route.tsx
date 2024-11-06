import Service_Form from "~/components/services/service_form";
import { useActionData, useLoaderData } from "@remix-run/react";

import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  replace,
} from "@remix-run/node";
import { prisma_client } from ".server/db";

import { capitalizeFirstLetter } from "~/utils/functions";
import { ServiceErrors, ServiceWithRelations } from "~/utils/service/types";
import { Category } from "@prisma/client";
import { serviceSchema } from "~/utils/service/validation.server";
import {
  fetchServiceFromId,
  getServiceFormData,
} from "~/utils/service/functions.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No ID provided in the parameter");
  }

  const service = await fetchServiceFromId({ id, includeCategory: true });
  if (!service) {
    throw new Error(`No Service found with id:${id}`);
  }
  const categories = await prisma_client.category.findMany();

  return { service, categories };
}

export async function action({ request, params }: ActionFunctionArgs) {
  console.log("In update action function")
  const {id} = params
  if(!id){
    throw new Error("No id provided in URL")
  }
    const formData = await request.formData();
  const serviceFormData = getServiceFormData(formData);

  const validationResult = serviceSchema.safeParse(serviceFormData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const { serv_name, serv_category, serv_price, serv_status } = validationResult.data;
  const updated_service = await update_service_fn({
    id,
    serv_name,
    serv_category,
    serv_price,
    serv_status,
  });
  throw replace(`/services/${updated_service.serv_id}`);
}

const update_service_fn = async ({
  id,
  serv_name,
  serv_category,
  serv_price,
  serv_status,
}: {
  id: string;
  serv_name: string;
  serv_category: string;
  serv_price: number;
  serv_status: boolean;
}) => {
  const capitalized_name = capitalizeFirstLetter(serv_name.toLowerCase());
  const current_date = new Date();
  const service = await prisma_client.service.update({
    where: {serv_id: id},
    data: {
      serv_name: capitalized_name,
      serv_category,
      serv_price,
    },
  });
  const deal = await prisma_client.deal.findFirst({
    where: {
        services: {
          some: {
            serv_id: id
          }
        },
        auto_generated: true
      }
  })
  //if serv_status is false, it means that the service has been updated 
  // to be inactive, so we assign activate_till a value of current date
  await prisma_client.deal.update({
    where: {deal_id: deal?.deal_id},
    data:{
        deal_name: capitalized_name,
        deal_price: serv_price,
        activate_till: serv_status? null : current_date
    }
  })

  return service;
};

export default function Update_Service() {
  const loaderData = useLoaderData<{
    service: ServiceWithRelations;
    categories: Category[];
  }>();
  const actionData = useActionData<{ errors: ServiceErrors }>();

  const categories= loaderData.categories;
  

  //convert deals date fields to date type
  const updated_deals = loaderData.service.deals.map(deal => {
    return {
      ...deal,
      created_at: new Date(deal.created_at),
      modified_at: new Date(deal.modified_at),
      activate_from: new Date(deal.activate_from),
      activate_till: deal.activate_till
        ? new Date(deal.activate_till)
        : null,
    };
  })

  const service = {
    ...loaderData.service,
    deals: updated_deals,
  }


  return (
    <div className="flex justify-center">
      <Service_Form
        service={service}
        categories={categories}
        errorMessage={actionData?.errors}
      />
    </div>
  );
}
