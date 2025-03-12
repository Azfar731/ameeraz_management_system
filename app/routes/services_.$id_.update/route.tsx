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
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 2 });

  const { id } = params;
  if (!id) {
    throw new Response("No ID provided in the parameter", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const service = await getServiceFromId({ id, includeCategory: true });
  if (!service) {
    throw new Response(`No Service found with id:${id}`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const categories = await prisma_client.category.findMany();

  return { service, categories };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 2 });

  const { id } = params;
  if (!id) {
    throw new Response("No id provided in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const formData = await request.formData();
  const serviceFormData = getServiceFormData(formData);

  const validationResult = serviceSchema.safeParse(serviceFormData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const { serv_name, serv_category, serv_price, serv_status } =
    validationResult.data;
  try {
    const updated_service = await updateService({
      serv_id: id,
      serv_name,
      serv_category,
      serv_price,
      serv_status,
    });
    throw replace(`/services/${updated_service.serv_id}`);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
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

export default function Update_Service() {
  const { service, categories } = useLoaderData<{
    service: ServiceWithRelations;
    categories: Category[];
  }>();
  const actionData = useActionData<{ errors: ServiceErrors }>();

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
