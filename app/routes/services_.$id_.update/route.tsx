import Service_Form from "~/components/services/service_form";
import { useActionData, useLoaderData } from "@remix-run/react";

import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  replace,
} from "@remix-run/node";
import { prisma_client } from "~/.server/db";

import { ServiceErrors, ServiceWithRelations } from "~/utils/service/types";
import { Category } from "@prisma/client";
import { serviceSchema } from "~/utils/service/validation.server";
import { getServiceFormData } from "~/utils/service/functions.server";
import { getServiceFromId, updateService } from "~/utils/service/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No ID provided in the parameter");
  }

  const service = await getServiceFromId({ id, includeCategory: true });
  if (!service) {
    throw new Error(`No Service found with id:${id}`);
  }
  const categories = await prisma_client.category.findMany();

  return { service, categories };
}

export async function action({ request, params }: ActionFunctionArgs) {
  console.log("In update action function");
  const { id } = params;
  if (!id) {
    throw new Error("No id provided in URL");
  }
  const formData = await request.formData();
  const serviceFormData = getServiceFormData(formData);

  const validationResult = serviceSchema.safeParse(serviceFormData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const { serv_name, serv_category, serv_price, serv_status } =
    validationResult.data;
  const updated_service = await updateService({
    serv_id: id,
    serv_name,
    serv_category,
    serv_price,
    serv_status,
  });
  throw replace(`/services/${updated_service.serv_id}`);
}


export default function Update_Service() {
  const loaderData = useLoaderData<{
    service: ServiceWithRelations;
    categories: Category[];
  }>();
  const actionData = useActionData<{ errors: ServiceErrors }>();

  const categories = loaderData.categories;

  //convert deals date fields to date type
  const updated_deals = loaderData.service.deals.map((deal) => {
    return {
      ...deal,
      created_at: new Date(deal.created_at),
      modified_at: new Date(deal.modified_at),
      activate_from: new Date(deal.activate_from),
      activate_till: deal.activate_till ? new Date(deal.activate_till) : null,
    };
  });

  const service = {
    ...loaderData.service,
    deals: updated_deals,
  };

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
