import { useLoaderData } from "@remix-run/react";
import { getProductSaleRecords } from "~/utils/productSaleRecord/db.server";
import { ProductSaleRecordWithRelations } from "~/utils/productSaleRecord/types";
import ProductSaleRecordTable from "../products-sale-record/ProductSaleRecordTable";
import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({request}: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 2 });
  const pending_records = await getProductSaleRecords({
    payment_cleared: false,
  });
  return { pending_records };
}

export default function Product_transaction_create_part1() {
  const { pending_records } = useLoaderData<{
    pending_records: ProductSaleRecordWithRelations[];
  }>();

  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-3xl text-gray-700">
          Choose a Pending Product Sale Record
        </h1>
      </div>

      <div className="mt-8">
        <ProductSaleRecordTable records={pending_records} />
      </div>
    </div>
  );
}
