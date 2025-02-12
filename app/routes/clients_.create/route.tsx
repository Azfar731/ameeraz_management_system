import { ActionFunctionArgs, replace } from "@remix-run/node";
import Client_Form from "~/components/clients/client_form";
import { useActionData } from "@remix-run/react";
import { clientSchema } from "../../utils/client/validation";
import { getClientFormData } from "~/utils/client/functions.server";
import { ClientErrorData } from "~/utils/client/types";
import { createClient } from "~/utils/client/db.server";
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const clientData = getClientFormData(formData);

  const validationResult = clientSchema.safeParse(clientData);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  

  const client = await createClient(validationResult.data);

  throw replace(`/clients/${client.client_id}`);
}

export default function Create_Client() {
  const actionData = useActionData<{errorMessages: ClientErrorData}>();
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Client_Form errorMessage={actionData?.errorMessages} />
    </div>
  );
}
