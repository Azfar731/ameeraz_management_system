import { ActionFunctionArgs, replace } from "@remix-run/node";
import Client_Form from "~/components/clients/client_form";
import { prisma_client } from ".server/db";
import { ClientValues } from "~/utils/types";
import { useActionData } from "@remix-run/react";
import { clientSchema } from "../../utils/client/validation";
import { getClientFormData } from "~/utils/client/functions.server";
import { ClientErrorData } from "~/utils/client/types";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const clientData = getClientFormData(formData);

  const validationResult = clientSchema.safeParse(clientData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  const { client_fname, client_lname, client_mobile_num, client_area } =
    validationResult.data;

    const client = await create_client_fn({
      client_fname,
      client_lname,
      client_mobile_num,
      client_area,
    });

    throw replace(`/clients/${client.client_id}`);
  
}

const create_client_fn = async ({
  client_fname,
  client_lname,
  client_mobile_num,
  client_area,
}: ClientValues) => {
  const client = await prisma_client.client.create({
    data: {
      client_fname: client_fname.toLowerCase(),
      client_lname: client_lname.toLowerCase(),
      client_area,
      client_mobile_num,
    },
  });
  return client;
};

export default function Create_Client() {
  const actionData = useActionData<ClientErrorData>();

  return (
    <div className="flex justify-center items-center h-screen">
      <Client_Form errorMessage={actionData?.errors} />
    </div>
  );
}
