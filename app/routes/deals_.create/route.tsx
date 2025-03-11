import { Service } from "@prisma/client";
import { useLoaderData, useActionData, replace } from "@remix-run/react";
import { DealErrors } from "~/utils/deal/types";
import Deal_Form from "~/components/deals/deal_form";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getDealFormData } from "~/utils/deal/functions.server";
import { dealSchema } from "~/utils/deal/validation";
import { getActiveServices } from "~/utils/service/db.server";
import { createDeal } from "~/utils/deal/db.server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({request}: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 2 });
  const services = await getActiveServices();
  return { services };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const dealFormData = getDealFormData(formData);
  const validationResult = dealSchema.safeParse(dealFormData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  try {
    const newDeal = await createDeal(validationResult.data);
    throw replace(`/deals/${newDeal.deal_id}`);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
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

export default function Create_Deal() {
  const { services } = useLoaderData<{ services: Service[] }>();
  const actionData = useActionData<{ errors: DealErrors }>();

  return (
    <div className="flex justify-center">
      <Deal_Form services={services} errorMessage={actionData?.errors} />
    </div>
  );
}
