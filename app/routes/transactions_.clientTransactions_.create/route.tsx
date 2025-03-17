import { useLoaderData, useNavigate } from "@remix-run/react";
import { ServiceSaleRecordWithRelations } from "~/utils/serviceSaleRecord/types";
import { fetchServiceSaleRecords } from "~/utils/serviceSaleRecord/db.server";
import SalesRecordTable from "../_index/SalesRecordTable";
import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });

  const pending_records = await fetchServiceSaleRecords({
    payment_cleared: false,
  });
  return { pending_records };
}

export default function Client_Transaction_Create_Part1() {
  const { pending_records } = useLoaderData<{
    pending_records: ServiceSaleRecordWithRelations[];
  }>();

  const navigate = useNavigate();

  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-3xl text-gray-700">
          Choose a Pending Sale Record
        </h1>
      </div>

      <div className="mt-8">
        <SalesRecordTable
          serviceRecords={pending_records}
          onEdit={(id) => navigate(`${id}`)}
        />
      </div>
    </div>
  );
}
