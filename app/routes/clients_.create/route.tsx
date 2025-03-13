import { ActionFunctionArgs, LoaderFunctionArgs, replace } from "@remix-run/node";
import Client_Form from "~/components/clients/client_form";
import { useActionData } from "@remix-run/react";
import { clientSchema } from "../../utils/client/validation";
import { getClientFormData } from "~/utils/client/functions.server";
import { ClientErrorData } from "~/utils/client/types";
import { createClient } from "~/utils/client/db.server";
import { authenticate } from "~/utils/auth/functions.server";
import { Prisma } from "@prisma/client";

export async function loader({request}: LoaderFunctionArgs){
  await authenticate({request, requiredClearanceLevel: 1 });
  return null;
}
export async function action({ request }: ActionFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 1 });

  const formData = await request.formData();
  const clientData = getClientFormData(formData);

  const validationResult = clientSchema.safeParse(clientData);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }

  try {
    const client = await createClient(validationResult.data);
    throw replace(`/clients/${client.client_id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errorMessages: {
            client_mobile_num: [
              `Client with mobile number ${validationResult.data.client_mobile_num} already exists`,
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

export default function Create_Client() {
  const actionData = useActionData<{ errorMessages: ClientErrorData }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Client_Form errorMessage={actionData?.errorMessages} />
    </div>
  );
}
