import { useLoaderData } from "@remix-run/react";
import { getProductSaleRecords } from "~/utils/productSaleRecord/db.server";
import { ProductSaleRecordWithRelations } from "~/utils/productSaleRecord/types";

export async function loader() {
  const pending_records = await getProductSaleRecords({
    payment_status: "pending",
  });
  return { pending_records };
}

export default function Product_transaction_create_part1() {
  const { pending_records } = useLoaderData<{
    pending_records: ProductSaleRecordWithRelations;
  }>();

  

}
