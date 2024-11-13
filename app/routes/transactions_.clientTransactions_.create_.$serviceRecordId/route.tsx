import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ClientTransaction_Form from "~/components/clientTransactions/clientTransactionForm";
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

export default function Client_Transaction_Create_Part2() {
  const loaderData = useLoaderData<{
    service_sale_record: Omit<
      ServiceSaleRecordWithRelations,
      "employees" | "deals"
    >;
  }>();

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
      <ClientTransaction_Form service_sale_record={service_sale_record} />
    </div>
  );
}
