//route to update salerecord
import { Deal, Employee } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import { getAllDeals } from "~/utils/deal/db.server";
import { getAllEmployees } from "~/utils/employee/db.server";
import {
  getServiceSaleRecordFromId,
  updateServiceSaleRecord,
} from "~/utils/serviceSaleRecord/db.server";
import {
  ServiceSaleRecordUpdateErrors,
  ServiceSaleRecordWithRelations,
} from "~/utils/serviceSaleRecord/types";
import Service_Sale_Record_Update_Form from "./Service_Sale_Record_Update_Form";
import { serviceSaleRecordUpdateSchema } from "~/utils/serviceSaleRecord/validation.server";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No id Provided in the URL");
  }
  const record = await getServiceSaleRecordFromId({
    id,
    includeClient: true,
    includeTransactions: true,
    includeEmployees: true,
    includeDeals: true,
  });
  if (!record) {
    throw new Error("Record with the specified Id doesn't exist");
  }
  const deals = await getAllDeals();
  const employees = await getAllEmployees();
  return { record, deals, employees };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No id Provided in the URL");
  }
  const record = await getServiceSaleRecordFromId({
    id,
    includeTransactions: true,
  });
  if (!record) {
    throw new Error("Record with the specified Id doesn't exist");
  }
  const amount_paid = record.transactions.reduce(
    (acc, curr) => acc + curr.amount_paid,
    0
  );
  const data = await request.json();
  data.amount_paid = amount_paid;
  const validationResult = await serviceSaleRecordUpdateSchema.safeParseAsync(data);
  if (!validationResult.success) {
    return {
      errorMessages: validationResult.error.flatten().fieldErrors,
    };
  }
  const updated_record = await updateServiceSaleRecord({
    ...validationResult.data,
    service_record_id: id,
  });
  throw replace(`/salerecord/${updated_record.service_record_id}`);
}

export default function Update_Service_Sale_Record() {
  const { record, deals, employees } = useLoaderData<{
    record: ServiceSaleRecordWithRelations;
    deals: Deal[];
    employees: Employee[];
  }>();

  const actionData = useActionData<{
    errorMessages: ServiceSaleRecordUpdateErrors;
  }>();

  return (
    <div className="flex justify-center items-center  ">
      <Service_Sale_Record_Update_Form
        deals={deals}
        record={record}
        employees={employees}
        errorMessages={actionData?.errorMessages}
      />
    </div>
  );
}
