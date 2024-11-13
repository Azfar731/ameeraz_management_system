import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useLoaderData, useActionData } from "@remix-run/react";
import ClientTransaction_Form from "~/components/clientTransactions/clientTransactionForm";
import { createClientTransaction } from "~/utils/clientTransaction/db.server";
import { getClientTransactionFormData } from "~/utils/clientTransaction/functions";
import { ClientTransactionErrors } from "~/utils/clientTransaction/types";
import { clientTransactionSchema } from "~/utils/clientTransaction/validation.server";
import { getServiceSaleRecordFromId } from "~/utils/saleRecord/db.server";
import { ServiceSaleRecordWithRelations } from "~/utils/saleRecord/types";

export async function loader({ params }: LoaderFunctionArgs) {
  const { serviceRecordId } = params;
  if (!serviceRecordId) {
    throw new Error("No Service Record Id provided");
  }
  const service_sale_record = await getServiceSaleRecordFromId({
    id: serviceRecordId,
    includeTransactions: true,
    includeClient: true,
  });
  if (!service_sale_record) {
    throw new Error(`No Sale record with id: ${serviceRecordId} exists`);
  }
  return { service_sale_record };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { serviceRecordId } = params;
  if (!serviceRecordId) {
    throw new Error("No Service Record Id provided");
  }

  const formData = await request.formData();
  const formValues = getClientTransactionFormData(formData);
  console.log("Form values: ", formValues);
  const validationResult = clientTransactionSchema.safeParse(formValues);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  console.log("Result: ", validationResult.data);
  const new_transaction = await createClientTransaction({
    ...validationResult.data,
    service_record_id: serviceRecordId,
  });

  throw replace(
    `/transactions/clientTransactions/${new_transaction.client_transaction_id}`
  );
}

export default function Client_Transaction_Create_Part2() {
  const loaderData = useLoaderData<{
    service_sale_record: Omit<
      ServiceSaleRecordWithRelations,
      "employees" | "deals"
    >;
  }>();

  const actionData = useActionData<{ errors: ClientTransactionErrors }>();

  const updated_transaction = loaderData.service_sale_record.transactions.map(
    (trans) => {
      return {
        ...trans,
        created_at: new Date(trans.created_at),
        modified_at: new Date(trans.modified_at),
      };
    }
  );
  //converting the type of Date objects
  const service_sale_record = {
    ...loaderData.service_sale_record,
    created_at: new Date(loaderData.service_sale_record.created_at),
    modified_at: new Date(loaderData.service_sale_record.modified_at),
    client: {
      ...loaderData.service_sale_record.client,
      created_at: new Date(loaderData.service_sale_record.client.created_at),
    },
    transactions: updated_transaction,
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <ClientTransaction_Form
        service_sale_record={service_sale_record}
        errorMessages={actionData?.errors}
      />
    </div>
  );
}
