import Service_Form from "~/components/services/service_form";
import { useActionData, useLoaderData } from "@remix-run/react";

import { ActionFunctionArgs, replace } from "@remix-run/node";
import { prisma_client } from "~/.server/db";

import { ServiceErrors } from "~/utils/service/types";
import { Prisma, Category } from "@prisma/client";
import { serviceSchema } from "~/utils/service/validation.server";
import { getServiceFormData } from "~/utils/service/functions.server";
import { createService } from "~/utils/service/db.server";
import { authenticate } from "~/utils/auth/functions.server";


export async function loader({ request }: ActionFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });

  const categories = await prisma_client.category.findMany();
  return { categories };
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });

  const formData = await request.formData();
  const serviceFormData = getServiceFormData(formData);

  const validationResult = serviceSchema.safeParse(serviceFormData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  try {
    const new_service = await createService(validationResult.data);
    throw replace(`/services/${new_service.serv_id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errors: {
            serv_name: [
              `Service with name: ${validationResult.data.serv_name} already exists`,
            ],
          },
        };
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}

export default function Create_Service() {
  const { categories } = useLoaderData<{ categories: Category[] }>();
  const actionData = useActionData<{ errors: ServiceErrors }>();

  return (
    <div className="flex justify-center">
      <Service_Form categories={categories} errorMessage={actionData?.errors} />
    </div>
  );
}
