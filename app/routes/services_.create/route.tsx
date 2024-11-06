import Service_Form from "~/components/services/service_form";
import { useActionData, useLoaderData } from "@remix-run/react";

import { ActionFunctionArgs, replace } from "@remix-run/node";
import { prisma_client } from "~/.server/db";

import { capitalizeFirstLetter } from "~/utils/functions";
import { ServiceErrors } from "~/utils/service/types";
import { Category } from "@prisma/client";
import { serviceSchema } from "~/utils/service/validation.server";
import { getServiceFormData } from "~/utils/service/functions.server";

export async function loader() {
  const categories = await prisma_client.category.findMany();
  return { categories };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const serviceFormData = getServiceFormData(formData);

  const validationResult = serviceSchema.safeParse(serviceFormData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const new_service = await create_service_fn(validationResult.data);
  throw replace(`/services/${new_service.serv_id}`);
}

const create_service_fn = async ({
  serv_name,
  serv_category,
  serv_price,
}: {
  serv_name: string;
  serv_category: string;
  serv_price: number;
}) => {
  const capitalized_name = capitalizeFirstLetter(serv_name.toLowerCase());
  const current_date = new Date();
  const service = await prisma_client.service.create({
    data: {
      serv_name: capitalized_name,
      serv_category,
      serv_price,
      deals: {
        create: [
          {
            deal_name: capitalized_name,
            deal_price: serv_price,
            activate_from: current_date,
            auto_generated: true,
          },
        ],
      },
    },
  });
  return service;
};

export default function Create_Service() {
  const { categories } = useLoaderData<{ categories: Category[] }>();
  const actionData = useActionData<{ errors: ServiceErrors }>();

  return (
    <div className="flex justify-center">
      <Service_Form categories={categories} errorMessage={actionData?.errors} />
    </div>
  );
}
