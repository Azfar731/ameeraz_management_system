import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import ClientTransaction_Form from "~/components/clientTransactions/clientTransactionForm";
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
import { updateServiceSaleRecordDateTypes } from "~/utils/saleRecord/functions";
import { getPendingAmount } from "~/utils/saleRecord/functions.server";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    throw new Error("Id parameter not provided in the URL");
  }

  const transaction = await getClientTransactionFromID({
    id,
    includeRecord: true,
  });
  if (!transaction) {
    throw new Error(`No transaction with id: ${id} exists`);
  }
  console.log("Transaction: ", transaction);
  return { transaction };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("NO ID in the URL");
  }

  const transaction = await getClientTransactionFromID({
    id,
    includeRecord: true,
  });
  if (!transaction) {
    throw new Error(`No transaction with id: ${id} exists`);
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

  throw replace(
    `/transactions/clientTransactions/${updated_transaction.client_transaction_id}`
  );
}

export default function ClientTransaction_Update() {
  const loaderData = useLoaderData<{
    transaction: ClientTransactionWithRelations;
  }>();

  const service_sale_record = updateServiceSaleRecordDateTypes(
    loaderData.transaction.record
  );

  const transaction = {
    ...loaderData.transaction,
    created_at: new Date(loaderData.transaction.created_at),
    modified_at: new Date(loaderData.transaction.modified_at),
    record: undefined,
  };

  const actionData = useActionData<{ errors: ClientTransactionErrors }>();

  return (
    <div className="flex justify-center items-center h-screen">
      <ClientTransaction_Form
        service_sale_record={service_sale_record}
        transaction={transaction}
        errorMessages={actionData?.errors}
      />
    </div>
  );
}
