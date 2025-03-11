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
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authenticate } from "~/utils/auth/functions.server";
export async function loader({request, params }: LoaderFunctionArgs) {
    await authenticate({request, requiredClearanceLevel: 2 });
  
  const { id } = params;
  if (!id) {
    throw new Response("Client id not provided for Client Update Page", {
      status: 400,
      statusText: "Bad Request: Missing ID parameter",
    });
  }
  const client = await getClientFromId({ id });
  if (!client) {
    throw new Response(`No client with id:${id} found`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { client };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Id not found in URL", {
      status: 400,
      statusText: "Bad Request: Missing ID parameter",
    });
  }
  const formData = await request.formData();
  const clientData = getClientFormData(formData);
  const validationResult = clientSchema.safeParse(clientData);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  try {
    const { updatedClient } = await updateClient({
      client_id: id,
      ...validationResult.data,
    });
    throw redirect(`/clients/${updatedClient.client_id}`);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errorMessages: {
            client_mobile_num: [
              `Client with mobile number: ${validationResult.data.client_mobile_num} already exists`,
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

export default function Update_Client() {
  const loaderData = useLoaderData<{ client: Client }>();
  const actionData = useActionData<{ errorMessages: ClientErrorData }>();

  const client = {
    ...loaderData.client,
    created_at: new Date(loaderData.client.created_at), // Convert the created_at string back to a Date object
  };
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Client_Form client={client} errorMessage={actionData?.errorMessages} />
    </div>
  );
}
