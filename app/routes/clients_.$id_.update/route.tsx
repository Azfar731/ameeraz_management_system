import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import Client_Form from "~/components/clients/client_form";
import { useLoaderData, useActionData } from "@remix-run/react";
import { Client } from "@prisma/client";
import { getClientFormData } from "~/utils/client/functions.server";
import { clientSchema } from "~/utils/client/validation";
import { ClientErrorData } from "~/utils/client/types";
import { getClientFromId, updateClient } from "~/utils/client/db.server";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Client id not provided for Client Update Page");
  }
  const client = await getClientFromId({ id });
  if (!client) {
    throw new Error(`No client with id:${id} found`);
  }
  return { client };
}

export async function action({ request, params }: ActionFunctionArgs) {
  console.log("In action function");
  const { id } = params;
  if (!id) {
    throw new Error("Id not found in URL");
  }
  const formData = await request.formData();
  const clientData = getClientFormData(formData);
  const validationResult = clientSchema.safeParse(clientData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const { client_fname, client_lname, client_mobile_num, client_area } =
    validationResult.data;

  const { updatedClient } = await updateClient({
    client_fname,
    client_lname,
    client_mobile_num,
    client_area,
    client_id: id,
  });
  console.log("Updated CLIent", updatedClient);
  throw redirect(`/clients/${updatedClient.client_id}`);
}

export default function Update_Client() {
  const loaderData = useLoaderData<{ client: Client }>();
  const actionData = useActionData<ClientErrorData>();

  const client = {
    ...loaderData.client,
    created_at: new Date(loaderData.client.created_at), // Convert the created_at string back to a Date object
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <Client_Form client={client} errorMessage={actionData?.errors} />
    </div>
  );
}
