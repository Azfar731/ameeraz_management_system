import { Prisma, Service } from "@prisma/client";
import { useLoaderData, useActionData, replace } from "@remix-run/react";
import { DealErrors, DealWithServices } from "~/utils/deal/types";
import Deal_Form from "~/components/deals/deal_form";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getDealFormData } from "~/utils/deal/functions.server";
import { dealSchema } from "~/utils/deal/validation";
import { getActiveServices } from "~/utils/service/db.server";
import { getDealFromId, updateDeal } from "~/utils/deal/db.server";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({request, params }: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 2 });
  const { id } = params;
  if (!id) {
    throw new Response("Id parameter not found in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const deal = await getDealFromId({ id, includeServices: true });
  if (!deal) {
    throw new Response(`No deal found with id: ${id}`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const services = await getActiveServices();
  return { deal, services };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 2 });

  const { id } = params;
  if (!id) {
    throw new Response("No id provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const formData = await request.formData();
  const dealFormData = getDealFormData(formData);
  const validationResult = dealSchema.safeParse(dealFormData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  try {
    const updatedDeal = await updateDeal({
      deal_id: id,
      ...validationResult.data,
    });

    throw replace(`/deals/${updatedDeal.deal_id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errors: {
            deal_name: [
              `Deal with name: ${validationResult.data.deal_name} already exists`,
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

export default function Update_Deal() {
  const { deal, services } = useLoaderData<{
    deal: DealWithServices;
    services: Service[];
  }>();
  const actionData = useActionData<{ errors: DealErrors }>();

  //convert date strings back to dates
  // const deal = {
  //   ...loaderData.deal,
  //   created_at: new Date(loaderData.deal.created_at),
  //   modified_at: new Date(loaderData.deal.modified_at),
  //   activate_from: new Date(loaderData.deal.activate_from),
  //   activate_till: loaderData.deal.activate_till
  //     ? new Date(loaderData.deal.activate_till)
  //     : null,
  // };

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
