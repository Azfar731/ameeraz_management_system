import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import ProductTransactionForm from "~/components/productTransactions/ProductTransactionsForm";
import { getProductSaleRecordByIdWithRelations } from "~/utils/productSaleRecord/db.server";
import { ProductSaleRecordWithRelations } from "~/utils/productSaleRecord/types";
import { createProductTransaction } from "~/utils/productTransaction/db.server";
import { getProductSaleRecordPendingAmount } from "~/utils/productTransaction/functions.server";
import { ProductTransactionErrorData } from "~/utils/productTransaction/types";
import {
    productTransactionSchema
} from "~/utils/productTransaction/validation.server";
export async function loader({ params }: LoaderFunctionArgs) {
  const { productSaleRecordId } = params;
  if (!productSaleRecordId) {
    throw new Error("NO ID providedin the URL");
  }
  const product_sale_record = await getProductSaleRecordByIdWithRelations({
    id: productSaleRecordId,
  });
  if (!product_sale_record)
    throw new Error(
      `No product sale record with id: ${productSaleRecordId} exists`
    );
  return { product_sale_record };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { productSaleRecordId } = params;
  if (!productSaleRecordId) {
    throw new Error("NO ID providedin the URL");
  }
  const formData = await request.formData();
  const formValues = Object.fromEntries(formData.entries());
  const maxAmount = await getProductSaleRecordPendingAmount(productSaleRecordId);
  const validationResult =
    productTransactionSchema(maxAmount).safeParse(formValues);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  const new_transaction = await createProductTransaction({...validationResult.data, product_record_id: productSaleRecordId});
  
  throw replace(`/transactions/product-transactions/${new_transaction.product_trans_id}`);
}


export default function Product_transaction_create_part2() {
  const { product_sale_record } = useLoaderData<{
    product_sale_record: ProductSaleRecordWithRelations;
  }>();

  const actionData = useActionData<{errorMessages: ProductTransactionErrorData}>();
  return (
    <div className="flex justify-center items-center h-screen">
      <ProductTransactionForm product_sale_record={product_sale_record} errorMessages={actionData?.errorMessages} />
    </div>
  );
}
