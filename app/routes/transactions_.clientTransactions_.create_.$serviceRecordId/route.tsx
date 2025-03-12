import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useLoaderData, useActionData } from "@remix-run/react";
import ClientTransaction_Form from "~/components/clientTransactions/clientTransactionForm";
import { createClientTransaction } from "~/utils/clientTransaction/db.server";
import { getClientTransactionFormData } from "~/utils/clientTransaction/functions";
import { ClientTransactionErrors } from "~/utils/clientTransaction/types";
import { clientTransactionSchema } from "~/utils/clientTransaction/validation.server";
import { ServiceSaleRecordWithRelations } from "~/utils/serviceSaleRecord/types";
import { getServiceSaleRecordFromId } from "~/utils/serviceSaleRecord/db.server";
import { getPendingAmount } from "~/utils/serviceSaleRecord/functions.server";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });

  const { serviceRecordId } = params;
  if (!serviceRecordId) {
    throw new Response("No Id provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const service_sale_record = await getServiceSaleRecordFromId({
    id: serviceRecordId,
    includeTransactions: true,
    includeClient: true,
  });
  if (!service_sale_record) {
    throw new Response(`No Sale record with id: ${serviceRecordId} exists`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { service_sale_record };
}

export async function action({ params, request }: ActionFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });

  const { serviceRecordId } = params;
  if (!serviceRecordId) {
    throw new Response("No Id provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const formData = await request.formData();
  const formValues = getClientTransactionFormData(formData);
  const remaining_amount = await getPendingAmount(serviceRecordId);
  const validationResult =
    clientTransactionSchema(remaining_amount).safeParse(formValues);

  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const new_transaction = await createClientTransaction({
    ...validationResult.data,
    service_record_id: serviceRecordId,
  });

  throw replace(
    `/transactions/clientTransactions/${new_transaction.client_transaction_id}`
  );
}

export default function Client_Transaction_Create_Part2() {
  const { service_sale_record } = useLoaderData<{
    service_sale_record: Omit<
      ServiceSaleRecordWithRelations,
      "employees" | "deals"
    >;
  }>();

  const actionData = useActionData<{ errors: ClientTransactionErrors }>();

  //converting the type of Date objects
  // const service_sale_record = updateServiceSaleRecordDateTypes(
  //   loaderData.service_sale_record
  // );
  return (
    <div className="flex justify-center items-center min-h-screen">
      <ClientTransaction_Form
        service_sale_record={service_sale_record}
        errorMessages={actionData?.errors}
      />
    </div>
  );
}
