import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { getClientTransactionFromID } from "~/utils/clientTransaction/db.server";
import { ClientTransactionErrors, ClientTransactionWithRelations } from "~/utils/clientTransaction/types";
import ClientTransaction_Form from "~/components/clientTransactions/clientTransactionForm";
import { updateServiceSaleRecordDateTypes } from "~/utils/saleRecord/functions";
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
  console.log("Transaction: ", transaction)
  return { transaction };
}

export async function action({params,request}: ActionFunctionArgs){
    const id = params
    if(!id){
        throw new Error("NO ID in the URL")
    }
    request.formData()
    return null
}

export default function ClientTransaction_Update() {
  const loaderData = useLoaderData<{
    transaction: ClientTransactionWithRelations;
  }>();

  const service_sale_record = updateServiceSaleRecordDateTypes(loaderData.transaction.record)
  
  
  
  
  
  const transaction = {
    ...loaderData.transaction,
    created_at: new Date(loaderData.transaction.created_at),
    modified_at: new Date(loaderData.transaction.modified_at),
    record: undefined
  } 

  const actionData = useActionData<{errors: ClientTransactionErrors}>()

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
