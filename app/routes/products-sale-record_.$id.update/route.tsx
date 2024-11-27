import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getProductSaleRecordById } from "~/utils/productSaleRecord/db.server";
import { ProductSaleRecordWithRelations } from "~/utils/productSaleRecord/types";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Product sale record ID is required");
  }
  const productSaleRecord = await getProductSaleRecordById({
    id,
    includeRelations: true,
  });
  if (!productSaleRecord) {
    throw new Error("Product sale record not found");
  }
  return { productSaleRecord };
}

export default function Update_Product_Sale_Record(){

    const {productSaleRecord} = useLoaderData<{productSaleRecord: Omit<ProductSaleRecordWithRelations, 'transactions'>}>()
    const {client,products: product_records, vendor} = productSaleRecord

    return(
        
    )

}
