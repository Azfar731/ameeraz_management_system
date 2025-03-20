import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import ClientTransaction_Form from "~/components/clientTransactions/clientTransactionForm";
import { authenticate } from "~/utils/auth/functions.server";
import {
  getClientTransactionFromID,
  updateClientTransaction,
} from "~/utils/clientTransaction/db.server";
import { getClientTransactionFormData } from "~/utils/clientTransaction/functions";
import {
  ClientTransactionErrors,
  ClientTransactionWithRelations,
} from "~/utils/clientTransaction/types";
import { clientTransactionSchema } from "~/utils/clientTransaction/validation.server";
import { createLog } from "~/utils/logs/db.server";
import { getPendingAmount } from "~/utils/serviceSaleRecord/functions.server";
export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });

  const { id } = params;

  if (!id) {
    throw new Response("Id parameter not provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const transaction = await getClientTransactionFromID({
    id,
    includeRecord: true,
  });
  if (!transaction) {
    throw new Response(`No transaction with id: ${id} exists`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  console.log("Transaction: ", transaction);
  return { transaction };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const userId = await authenticate({ request, requiredClearanceLevel: 2 });

  const { id } = params;
  if (!id) {
    throw new Response("NO ID in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const transaction = await getClientTransactionFromID({
    id,
    includeRecord: true,
  });
  if (!transaction) {
    throw new Response(`No transaction with id: ${id} exists`, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const formData = await request.formData();
  const formValues = getClientTransactionFormData(formData);

  //exclude current transaction from the remaining amount
  const new_remaining_amount =
    (await getPendingAmount(transaction.record_id)) + transaction.amount_paid;
  const validationResult =
    clientTransactionSchema(new_remaining_amount).safeParse(formValues);

  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const updated_transaction = await updateClientTransaction({
    ...validationResult.data,
    id,
    new_remaining_amount,
  });

  await createLog({
    userId,
    log_type: "update",
    log_message: `updated Client Transaction Record. Link: /transactions/clientTransactions/${updated_transaction.client_transaction_id}`,
  });
  throw replace(
    `/transactions/clientTransactions/${updated_transaction.client_transaction_id}`
  );
}

export default function ClientTransaction_Update() {
  const { transaction } = useLoaderData<{
    transaction: ClientTransactionWithRelations;
  }>();

  // const service_sale_record = updateServiceSaleRecordDateTypes(
  //   loaderData.transaction.record
  // );

  // const transaction = {
  //   ...loaderData.transaction,
  //   created_at: new Date(loaderData.transaction.created_at),
  //   modified_at: new Date(loaderData.transaction.modified_at),
  //   record: undefined,
  // };

  const actionData = useActionData<{ errors: ClientTransactionErrors }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ClientTransaction_Form
        service_sale_record={transaction.record}
        transaction={transaction}
        errorMessages={actionData?.errors}
      />
    </div>
  );
}
